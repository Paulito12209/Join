import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { TasksService } from '../../core/services/tasks.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../core/services/contacts.service';
import { Task, Subtask } from '../add-task/task';
import { Router, RouterOutlet } from '@angular/router';
import { AddTaskBoard } from './add-task-board';

@Component({
  selector: 'app-board',
  imports: [CdkDropList, CdkDrag, CommonModule, RouterOutlet, FormsModule, AddTaskBoard],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private tasksService = inject(TasksService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // All tasks (unfiltered)
  private allTasks: Task[] = [];

  // Search query
  searchQuery: string = '';

  // Displayed arrays
  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];

  // ++++++++Dialog state for Add Task +++++++++++++++++++++++++++++++
  isAddDialogOpen = false;

  constructor() {
    this.tasksService.list().subscribe((tasks) => {
      this.allTasks = tasks;
      this.filterTasks();
      this.cdr.detectChanges();
    });
  }

  // Filter tasks based on searchQuery
  filterTasks() {
    let filtered = this.allTasks;

    if (this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.toLowerCase();
      filtered = this.allTasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    this.todo = filtered.filter(t => t.status === 'todo');
    this.inProgress = filtered.filter(t => t.status === 'in-progress');
    this.awaitFeedback = filtered.filter(t => t.status === 'awaiting-feedback');
    this.done = filtered.filter(t => t.status === 'done');
  }

  // ++++++ dialog function: onaddclose openAddTask onAddCreate+++++++++++

  openAddTask(): void {
    this.isAddDialogOpen = true;
  }

  onAddClose(): void {
    this.isAddDialogOpen = false;
  }

  async onAddCreate(formValue: any): Promise<void> {
    const priorityMap: Record<string, Task['priority']> = {
      Urgent: 'urgent',
      Medium: 'medium',
      Low: 'low',
    };

    const subtasks: Subtask[] = [];
    if (formValue?.subtask && typeof formValue.subtask === 'string' && formValue.subtask.trim()) {
      subtasks.push({ id: this.randomId(), title: formValue.subtask.trim(), done: false });
    }

    const payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formValue.title,
      description: formValue.description ?? '',
      status: 'todo',
      priority: (priorityMap[formValue.priority] ?? 'medium'),
      dueDate: formValue.dueDate ?? undefined,
      category: 'user-story',
      assignees: [],
      ...(subtasks.length ? { subtasks } : {}),
    };

    try {
      await this.tasksService.create(payload);
      this.isAddDialogOpen = false;
    } catch (err) {
      console.error('Failed to create task', err);
    }
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  drop(event: CdkDragDrop<Task[]>) {
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

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  openTask(task: Task): void {
    if (!task.id) return;
    this.router.navigate(['/board', task.id]);
  }
}
