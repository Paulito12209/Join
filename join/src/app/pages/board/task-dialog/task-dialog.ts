import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { TasksService } from '../../../core/services/tasks.service';
import { ContactsService, Contact } from '../../../core/services/contacts.service';
import { Task, AssigneeRef, Subtask } from '../../add-task/task';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);
  private readonly contactsService = inject(ContactsService);

  taskId$ = this.route.paramMap.pipe(map((p) => p.get('id') ?? ''));
  task$ = this.taskId$.pipe(switchMap((id) => this.tasksService.getById(id)));
  isEdit$ = this.route.url.pipe(map((segments) => segments.some((s) => s.path === 'edit')));

  contacts$ = this.contactsService.getContacts(); // <-- dein Service

  taskView$ = combineLatest([this.task$, this.contacts$]).pipe(
    map(([task, contacts]) => {
      const contactsById = new Map<string, Contact>();
      contacts.forEach((contact) => {
        if (contact.id) contactsById.set(contact.id, contact);
      });

      return { task, contactsById };
    })
  );

  close(): void {
    this.router.navigate(['/board']);
  }

  async deleteTask(task: Task): Promise<void> {
    if (!task.id) return;

    await this.tasksService.remove(task.id);
    this.close();
  }

  openEdit(task: Task): void {
    if (!task.id) return;
    this.router.navigate(['/board', task.id, 'edit']);
  }

  backToView(task: Task): void {
    if (!task.id) return;
    this.router.navigate(['/board', task.id]);
  }

  async toggleSubtask(task: Task, subtask: Subtask): Promise<void> {
    if (!task.id) return;

    const currentSubtasks = task.subtasks ?? [];

    const nextSubtasks = currentSubtasks.map((existingSubtask) => {
      if (existingSubtask.id !== subtask.id) {
        return existingSubtask;
      }

      return {
        ...existingSubtask,
        done: !existingSubtask.done,
      };
    });

    await this.tasksService.update(task.id, { subtasks: nextSubtasks });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  getAssigneeName(a: AssigneeRef, mapById: Map<string, Contact>): string {
    const c = mapById.get(a.uid);
    return c?.name ?? a.name ?? a.email ?? a.uid;
  }

  getAssigneeColor(a: AssigneeRef, mapById: Map<string, Contact>): string {
    const c = mapById.get(a.uid);
    return c?.color ?? '#ccc';
  }

  getCategoryLabel(category?: Task['category']): string {
    if (category === 'user-story') return 'User Story';
    if (category === 'technical-task') return 'Technical Task';
    return 'Uncategorized';
  }

  buildAssigneeViews(
    assignees: AssigneeRef[] | undefined,
    contactsById: Map<string, Contact>
  ): { uid: string; name: string; initials: string; color: string }[] {
    if (!assignees?.length) return [];

    return assignees.map((assignee) => {
      const name = this.getAssigneeName(assignee, contactsById);
      return {
        uid: assignee.uid,
        name,
        initials: this.getInitials(name),
        color: this.getAssigneeColor(assignee, contactsById),
      };
    });
  }
}
