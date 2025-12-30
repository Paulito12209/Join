import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

import { Contact } from '../../../../core/services/contacts.service';
import { AssigneeRef, Subtask, Task } from '../../../add-task/task';

@Component({
  selector: 'app-task-dialog-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-dialog-edit.html',
  styleUrl: './task-dialog-edit.scss',
})
export class TaskDialogEdit implements OnChanges {
  @Input({ required: true }) task!: Task;
  @Input() contacts: Contact[] | null = [];

  readonly today = new Date().toISOString().slice(0, 10);
  editForm: FormGroup;
  assigneeOpen = false;

  selectedAssigneeIds: string[] = [];

  newSubtaskTitle = '';
  subtasks: Subtask[] = [];
  editSubtaskId: string | null = null;
  editSubtaskTitle = '';
  subtaskFocus = false;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (!this.task) return;

    const dueDateValue = this.toDateInputValue(this.task.dueDate);

    this.editForm.patchValue({
      title: this.task.title ?? '',
      description: this.task.description ?? '',
      dueDate: dueDateValue,
      priority: (this.task.priority ?? 'medium') as Task['priority'],
    });

    this.selectedAssigneeIds = (this.task.assignees ?? [])
      .map((assignee) => assignee.uid)
      .filter((uid) => !!uid);

    this.subtasks = (this.task.subtasks ?? []).map((subtask) => ({ ...subtask }));
  }

  private toDateInputValue(value: any): string {
    if (!value) return '';
    if (typeof value !== 'string') return '';
    return value.length >= 10 ? value.slice(0, 10) : '';
  }

  closeAssigneeDropdown(): void {
    this.assigneeOpen = false;
  }

  // -----------------------------
  // Assignees
  // -----------------------------

  toggleAssignee(userId: string, shouldAssign: boolean): void {
    const currentIds = this.selectedAssigneeIds;

    if (shouldAssign) {
      this.selectedAssigneeIds = Array.from(new Set([...currentIds, userId]));
      return;
    }

    this.selectedAssigneeIds = currentIds.filter((existingUserId) => existingUserId !== userId);
  }

  isAssigned(userId: string): boolean {
    return this.selectedAssigneeIds.includes(userId);
  }

  getInitials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .map((namePart) => namePart[0])
      .join('')
      .toUpperCase();
  }

  getContact(userId: string): Contact | null {
    return (this.contacts ?? []).find((contact) => contact.id === userId) ?? null;
  }

  getContactColor(userId: string): string {
    return this.getContact(userId)?.color ?? '#6c63ff';
  }

  getContactInitials(userId: string): string {
    const contactName = this.getContact(userId)?.name ?? '';
    return this.getInitials(contactName);
  }

  // -----------------------------
  // Subtasks
  // -----------------------------

  addSubtask(): void {
    const trimmedTitle = this.newSubtaskTitle.trim();
    if (!trimmedTitle) return;

    const newSubtask: Subtask = {
      id: this.randomId(),
      title: trimmedTitle,
      done: false,
    };

    this.subtasks = [...this.subtasks, newSubtask];
    this.newSubtaskTitle = '';
  }

  clearSubtaskInput(): void {
    this.newSubtaskTitle = '';
  }

  removeSubtask(subtaskId: string): void {
    this.subtasks = this.subtasks.filter((subtask) => subtask.id !== subtaskId);

    if (this.editSubtaskId === subtaskId) {
      this.cancelEditSubtask();
    }
  }

  startEditSubtask(subtaskId: string, title: string): void {
    this.editSubtaskId = subtaskId;
    this.editSubtaskTitle = title;
  }

  saveEditSubtask(subtaskId: string): void {
    const trimmedTitle = this.editSubtaskTitle.trim();
    if (!trimmedTitle) return;

    this.subtasks = this.subtasks.map((subtask) => {
      if (subtask.id !== subtaskId) return subtask;
      return { ...subtask, title: trimmedTitle };
    });

    this.cancelEditSubtask();
  }

  cancelEditSubtask(): void {
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  // -----------------------------
  // Build update payload (used by parent via ViewChild)
  // -----------------------------
  buildUpdatePayload(): Partial<Task> {
    const formValue = this.editForm.value;

    const assignees: AssigneeRef[] = this.selectedAssigneeIds.map((userId) => ({ uid: userId }));

    return {
      title: formValue.title,
      description: formValue.description,
      dueDate: formValue.dueDate,
      priority: formValue.priority,
      assignees,
      subtasks: this.subtasks,
      updatedAt: new Date().toISOString(),
    };
  }
}
