import { Component, ChangeDetectorRef, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { TasksService } from '../../../core/services/tasks.service';
import { ContactsService, Contact } from '../../../core/services/contacts.service';
import { Task, AssigneeRef, Subtask } from '../../add-task/task';
import { TaskDialogEdit } from './task-dialog-edit/task-dialog-edit';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe, TaskDialogEdit],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);
  private readonly contactsService = inject(ContactsService);
  private readonly cdr = inject(ChangeDetectorRef);

  taskId$ = this.route.paramMap.pipe(map((p) => p.get('id') ?? ''));
  task$ = this.taskId$.pipe(switchMap((id) => this.tasksService.getById(id)));
  isEdit$ = this.route.url.pipe(map((segments) => segments.some((s) => s.path === 'edit')));
  isClosing = false;
  disableEnterAnimation = false;
  isHardClose = false;

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

  @ViewChild(TaskDialogEdit) editCmp?: TaskDialogEdit;
  @ViewChild('dialogEl') dialogEl?: ElementRef<HTMLElement>;
  fixedHeight: number | null = null;

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras.state as any) ?? history.state;

    this.disableEnterAnimation = !!state?.skipEnter;
    this.fixedHeight = typeof state?.dialogHeight === 'number' ? state.dialogHeight : null;
  }

  close(): void {
    this.isClosing = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.router.navigate(['/board']);
    }, 400);
  }

  deleteTask(task: Task): void {
    if (!task.id) return;

    this.hardClose();
    void this.tasksService.remove(task.id);
  }

  openEdit(task: Task): void {
    if (!task.id) return;

    const height = this.dialogEl?.nativeElement.getBoundingClientRect().height ?? null;

    this.router.navigate(['/board', task.id, 'edit'], {
      state: { skipEnter: true, dialogHeight: height },
    });
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

  async onOk(task: Task): Promise<void> {
    if (!task.id) return;

    if (this.editCmp) {
      this.editCmp.editForm.markAllAsTouched();

      if (this.editCmp.editForm.invalid) {
        return;
      }
    }

    const payload = this.editCmp?.buildUpdatePayload();
    if (!payload) {
      this.router.navigate(['/board', task.id], { state: { skipEnter: true } });
      return;
    }

    await this.tasksService.update(task.id, payload);

    this.router.navigate(['/board', task.id], {
      state: { skipEnter: true },
    });
  }

  private hardClose() {
    this.isHardClose = true;
    this.router.navigate(['/board']);
  }

  onDialogClick(event: MouseEvent): void {
    // Klick IM Dialog soll nie das Overlay erreichen
    event.stopPropagation();

    // Falls Edit-Komponente existiert: Dropdown schließen
    this.editCmp?.closeAssigneeDropdown();
  }

  onOverlayClick(event: MouseEvent): void {
    // Overlay-Klick: wenn Dropdown offen, nur Dropdown schließen
    if (this.editCmp?.assigneeOpen) {
      event.stopPropagation();
      this.editCmp.closeAssigneeDropdown();
      return;
    }

    // sonst Dialog schließen
    this.close();
  }
}
