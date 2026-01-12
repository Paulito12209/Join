import { Injectable, inject, NgZone } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore'; // Add onSnapshot
import { Task } from '../../pages/add-task/task';

/**
 * Tasks Service
 * 
 * Manages task data in Firestore with real-time synchronization.
 * 
 * **Features:**
 * - Real-time task updates using Firestore snapshots
 * - Automatic timestamp management (createdAt, updatedAt)
 * - Task filtering by status
 * - Live updates across all connected clients
 * - Angular Zone integration for proper change detection
 * 
 * **Real-time Updates:**
 * All query methods use Firestore's `onSnapshot` listener to provide live updates.
 * When any client creates, updates, or deletes a task, all subscribed components
 * automatically receive the updated data without manual refresh.
 * 
 * **Change Detection:**
 * The service runs all Firestore callbacks inside Angular's NgZone to ensure
 * that UI updates are triggered automatically when data changes.
 * 
 * @injectable
 * 
 * @example
 * // Inject the service
 * constructor(private tasksService: TasksService) {}
 * 
 * // Subscribe to all tasks with live updates
 * this.tasksService.list().subscribe(tasks => {
 *   console.log('Tasks updated:', tasks);
 * });
 * 
 * // Create a new task
 * await this.tasksService.create({
 *   title: 'New Task',
 *   description: 'Task description',
 *   status: 'todo',
 *   priority: 'medium',
 *   assignedTo: [],
 *   category: 'Development',
 *   subtasks: [],
 *   dueDate: '2024-12-31'
 * });
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  /** Firestore instance for database operations */
  private firestore = inject(Firestore);
  /** NgZone for running callbacks inside Angular's change detection */
  private ngZone = inject(NgZone);

  /** Firestore collection path for tasks */
  private readonly collectionPath = 'tasks';

  /**
   * Stream all tasks ordered by `createdAt`.
   * Uses `onSnapshot` for live updates.
   *
   * @returns Observable that emits arrays of `Task` objects.
   */
  list(): Observable<Task[]> {
    return new Observable<Task[]>(observer => {
      const colRef = collection(this.firestore, this.collectionPath);
      const q = query(colRef, orderBy('createdAt'));

      // Live updates via onSnapshot
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: Task[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Task;
          items.push({ id: doc.id, ...data });
        });

        // Run inside Angular Zone to trigger Change Detection
        this.ngZone.run(() => {
          observer.next(items);
        });
      }, (error) => {
        console.error("Firestore Error:", error);
        observer.error(error);
      });

      return () => {
        unsubscribe();
      };
    });
  }

  /**
   * Stream a single task by its Firestore ID.
   * Backed by `list()` to reuse the live stream and avoid duplicate listeners.
   * @param id Firestore document ID.
   */
  getById(id: string): Observable<Task | null> {
    return this.list().pipe(map(items => items.find(t => t.id === id) ?? null));
  }

  /**
   * Stream tasks filtered by a specific status.
   * @param status Task status to include in the result.
   */
  listByStatus(status: Task['status']): Observable<Task[]> {
    return this.list().pipe(map(items => items.filter(t => t.status === status)));
  }

  /**
   * Create a new task document in Firestore.
   * Adds `createdAt` and `updatedAt` timestamps on the server side.
   *
   * @param task Task data without `id`, `createdAt`, `updatedAt`.
   * @returns The created task including generated `id`.
   */
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const colRef = collection(this.firestore, this.collectionPath);
    const now = new Date().toISOString();
    const payload: Task = { ...task, createdAt: now, updatedAt: now };
    const docRef = await addDoc(colRef, payload as any);
    return { id: docRef.id, ...payload };
  }

  /**
   * Update an existing task by ID.
   * Merges provided fields and refreshes `updatedAt` timestamp.
   *
   * Note: The returned object contains the patched fields plus `id` and `updatedAt`.
   * If full task data is required, read the document after updating.
   *
   * @param id Firestore document ID.
   * @param patch Partial task data to update.
   * @returns The updated task shape (patched fields) or `null`.
   */
  async update(id: string, patch: Partial<Task>): Promise<Task | null> {
    const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    const updatedAt = new Date().toISOString();
    await updateDoc(docRef, { ...patch, updatedAt } as any);
    return { id, ...(patch as Task), updatedAt } as Task;
  }

  /**
   * Delete a task by ID.
   *
   * @param id Firestore document ID.
   * @returns `true` when deletion completes.
   */
  async remove(id: string): Promise<boolean> {
    const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    await deleteDoc(docRef);
    return true;
  }
}
