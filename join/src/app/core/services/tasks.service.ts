import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore'; // Add onSnapshot
import { Task } from '../../pages/add-task/task';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private firestore = inject(Firestore);

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
        observer.next(items);
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
