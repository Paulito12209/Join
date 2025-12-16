import { Component, inject } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { TasksService } from '../../core/services/tasks.service';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../core/services/contacts.service';
import { Task } from '../add-task/task'; // Import Task interface

@Component({
  selector: "app-board",
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: "./board.html",
  styleUrl: "./board.scss",
})
export class Board {
  private tasksService = inject(TasksService);

  // Separate arrays for each status
  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];

  constructor() {
    this.tasksService.list().subscribe((tasks) => {
      // Clear arrays to avoid duplicates on update (or use a smarter diffing if performance matters later)
      this.todo = tasks.filter(t => t.status === 'todo');
      this.inProgress = tasks.filter(t => t.status === 'in-progress');
      this.awaitFeedback = tasks.filter(t => t.status === 'awaiting-feedback');
      this.done = tasks.filter(t => t.status === 'done');
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
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
}
