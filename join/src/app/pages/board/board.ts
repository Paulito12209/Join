import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { TasksService } from '../../core/services/tasks.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact, ContactsService } from '../../core/services/contacts.service';
import { Task, Subtask } from '../add-task/task';
import { Router, RouterOutlet } from '@angular/router';
import { AddTaskBoard } from './add-task-board';

/**
 * Board component for the Kanban board.
 * Displays tasks in four columns (ToDo, In Progress, Awaiting Feedback, Done)
 * and enables drag & drop between columns.
 */
@Component({
  selector: 'app-board',
  imports: [CdkDropList, CdkDrag, CommonModule, RouterOutlet, FormsModule, AddTaskBoard],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  /** Service for CRUD operations on tasks */
  private tasksService = inject(TasksService);
  /** Service for contact data (assignees) */
  private contactsService = inject(ContactsService);
  /** Angular ChangeDetectorRef for manual change detection */
  private cdr = inject(ChangeDetectorRef);
  /** Angular Router for navigation */
  private router = inject(Router);

  /** Detects if device is touch-enabled (for drag delay) */
  isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  /** Delay in ms before drag starts (prevents accidental drag on mobile) */
  dragDelay = this.isMobile ? 400 : 0;

  /** All tasks (unfiltered) from Firestore */
  private allTasks: Task[] = [];

  /** Map of contact IDs to contact objects for fast resolution of assignee details */
  private contactsMap: Map<string, Contact> = new Map();

  /** Current search term for task filtering */
  searchQuery: string = '';

  /** Filtered tasks with status 'todo' */
  todo: Task[] = [];
  /** Filtered tasks with status 'in-progress' */
  inProgress: Task[] = [];
  /** Filtered tasks with status 'awaiting-feedback' */
  awaitFeedback: Task[] = [];
  /** Filtered tasks with status 'done' */
  done: Task[] = [];

  /** Controls visibility of the Add Task dialog */
  isAddDialogOpen = false;
  /** Status assigned to new task (depends on column from which dialog was opened) */
  currentAddStatus: Task['status'] = 'todo';

  /**
   * Initializes the Board component.
   * Subscribes to tasks and contacts from Firestore for live updates.
   */
  constructor() {
    this.tasksService.list().subscribe((tasks) => {
      this.allTasks = tasks;
      this.filterTasks();
      this.cdr.detectChanges();
    });

    this.contactsService.getContacts().subscribe((contacts) => {
      this.contactsMap.clear();
      contacts.forEach((c) => {
        if (c.id) this.contactsMap.set(c.id, c);
      });
      this.cdr.detectChanges();
    });
  }

  /**
   * Filters all tasks based on the current search term
   * and distributes them to the corresponding status arrays.
   */
  filterTasks(): void {
    let filtered = this.allTasks;

    if (this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.toLowerCase();
      filtered = this.allTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    this.todo = filtered.filter((t) => t.status === 'todo');
    this.inProgress = filtered.filter((t) => t.status === 'in-progress');
    this.awaitFeedback = filtered.filter((t) => t.status === 'awaiting-feedback');
    this.done = filtered.filter((t) => t.status === 'done');
  }

  /**
   * Opens the Add Task dialog for a specific column.
   * @param status - The status to assign to the new task (default: 'todo')
   */
  openAddTask(status: Task['status'] = 'todo'): void {
    this.currentAddStatus = status;
    this.isAddDialogOpen = true;
  }

  /**
   * Closes the Add Task dialog without saving.
   */
  onAddClose(): void {
    this.isAddDialogOpen = false;
  }

  /**
   * Processes the form from the Add Task dialog and creates a new task.
   * @param formValue - The form data from the dialog
   */
  async onAddCreate(formValue: any): Promise<void> {
    const priorityMap: Record<string, Task['priority']> = {
      Urgent: 'urgent',
      Medium: 'medium',
      Low: 'low',
    };

    const subtasks: Subtask[] = Array.isArray(formValue.subtasks) ? formValue.subtasks : [];
    if (formValue?.subtask && typeof formValue.subtask === 'string' && formValue.subtask.trim()) {
      // Optional: Add the one in the input if user forgot to click add?
      // Start with existing logic: User said "it does not save in the array".
      // I should probably prioritize the array.
      // If I assume the component handles the list, then subtasks array is all that matters.
      // But keeping the old logic as a fallback or addition might use the leftover input.
      // However, since I fixed the array logic, let's trust the array.
      // But let's append just in case? No, usually that's annoying.
      // I'll just use the array.
    }

    const payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formValue.title,
      description: formValue.description ?? '',
      status: this.currentAddStatus,
      priority: priorityMap[formValue.priority] ?? 'medium',
      dueDate: formValue.dueDate ?? undefined,
      category: formValue.category === 'Technical Task' ? 'technical-task' : 'user-story',
      assignees: (formValue.assignedTo ?? []).map((uid: string) => ({ uid })),
      ...(subtasks.length ? { subtasks } : {}),
    };

    try {
      await this.tasksService.create(payload);
      this.isAddDialogOpen = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  }

  /**
   * Generates a random ID for local use.
   * @returns A randomly generated alphanumeric ID
   */
  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  /**
   * Handles the drop event during drag & drop of tasks.
   * Updates the task status in Firestore and moves the element in the array.
   * @param event - The CDK Drag-Drop event with source and target container
   */
  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      // Determine new status based on the container ID
      // Note: We need to set IDs on cdkDropList in HTML for this to work robustly,
      // or infer it from the list instance. Ideally we pass the target status to the list or infer it.
      // A simpler way is to check which array is which, but cdkDropListConnectedTo usage suggests we know the lists.

      // Let's assume we map the array to the status manually for now or use the ID.
      let newStatus: Task['status'] = 'todo'; // default

      if (event.container.id === 'progressList') newStatus = 'in-progress';
      else if (event.container.id === 'feedbackList') newStatus = 'awaiting-feedback';
      else if (event.container.id === 'doneList') newStatus = 'done';
      else if (event.container.id === 'todoList') newStatus = 'todo';

      // Updates Firestore (and local state via subscription)
      if (task.id) {
        this.tasksService.update(task.id, { status: newStatus });
      }

      // Update local task status immediately to prevent issues with filtering
      task.status = newStatus;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /**
   * Opens the detail view of a task.
   * @param task - The task whose details should be displayed
   */
  openTask(task: Task): void {
    if (!task.id) return;
    this.router.navigate(['/board', task.id]);
  }

  /**
   * Counts the completed subtasks of a task.
   * @param task - The task whose subtasks should be counted
   * @returns Number of completed subtasks
   */
  getCompletedSubtasksCount(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return task.subtasks.filter((s) => s.done).length;
  }

  /**
   * Extracts initials from a name (e.g., "Max Mustermann" → "MM").
   * @param name - Full name of the assignee
   * @returns Initials (max. 2 characters) or "?" if no name provided
   */
  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Resolves initials for an assignee based on contact data.
   * @param assignee - Object with UID and optional name
   * @returns Initials of the assignee
   */
  getAssigneeInitials(assignee: { uid: string; name?: string }): string {
    const contact = this.contactsMap.get(assignee.uid);
    if (contact?.name) {
      return this.getInitials(contact.name);
    }
    return this.getInitials(assignee.name);
  }

  /**
   * Resolves the avatar color for an assignee based on contact data.
   * @param assignee - Object with UID and optional color
   * @returns Hex color code of the assignee or default gray (#ccc)
   */
  getAssigneeColor(assignee: { uid: string; color?: string }): string {
    const contact = this.contactsMap.get(assignee.uid);
    if (contact?.color) {
      return contact.color;
    }
    return assignee.color || '#ccc';
  }

  /**
   * Returns the path to the priority icon.
   * @param priority - Priority level of the task
   * @returns Path to the corresponding SVG icon
   */
  getPriorityIcon(priority: Task['priority']): string {
    const icons: Record<Task['priority'], string> = {
      urgent: 'img/icons/prio-urgent.svg',
      high: 'img/icons/prio-urgent.svg',
      medium: 'img/icons/prio-medium.svg',
      low: 'img/icons/prio-low.svg',
    };
    return icons[priority] || icons['medium'];
  }
}
