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

/**
 * Task edit dialog component.
 *
 * @remarks
 * Provides a form-based interface for editing an existing task,
 * including title, description, due date, priority, assignees,
 * and subtasks. The component manages local edit state and
 * exposes an update payload to the parent component.
 */
@Component({
  selector: 'app-task-dialog-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-dialog-edit.html',
  styleUrl: './task-dialog-edit.scss',
})
export class TaskDialogEdit implements OnChanges {
  /**
   * Task to be edited.
   */
  @Input({ required: true }) task!: Task;

  /**
   * List of available contacts that can be assigned to the task.
   */
  @Input() contacts: Contact[] | null = [];

  /**
   * ISO date string (YYYY-MM-DD) representing today's date.
   * Used for date input constraints.
   */
  readonly today = new Date().toISOString().slice(0, 10);

  /**
   * Reactive form holding editable task fields.
   */
  editForm: FormGroup;

  /**
   * Indicates whether the assignee dropdown is open.
   */
  assigneeOpen = false;

  /**
   * List of selected assignee user IDs.
   */
  selectedAssigneeIds: string[] = [];

  /**
   * Temporary title for creating a new subtask.
   */
  newSubtaskTitle = '';

  /**
   * Local editable copy of task subtasks.
   */
  subtasks: Subtask[] = [];

  /**
   * ID of the subtask currently being edited.
   */
  editSubtaskId: string | null = null;

  /**
   * Temporary title for editing an existing subtask.
   */
  editSubtaskTitle = '';

  /**
   * Indicates whether the subtask input currently has focus.
   */
  subtaskFocus = false;

  /**
   * Creates the edit form and initializes default values.
   */
  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  /**
   * Reacts to changes of the input task and
   * initializes the form and local state accordingly.
   */
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

  /**
   * Converts a stored date value into a format
   * compatible with HTML date inputs.
   */
  private toDateInputValue(value: any): string {
    if (!value) return '';
    if (typeof value !== 'string') return '';
    return value.length >= 10 ? value.slice(0, 10) : '';
  }

  /**
   * Closes the assignee dropdown.
   */
  closeAssigneeDropdown(): void {
    this.assigneeOpen = false;
  }

  /**
   * Adds or removes a user from the selected assignees list.
   *
   * @param userId - ID of the user to toggle
   * @param shouldAssign - Whether the user should be assigned
   */
  toggleAssignee(userId: string, shouldAssign: boolean): void {
    const currentIds = this.selectedAssigneeIds;

    if (shouldAssign) {
      this.selectedAssigneeIds = Array.from(new Set([...currentIds, userId]));
      return;
    }

    this.selectedAssigneeIds = currentIds.filter((existingUserId) => existingUserId !== userId);
  }

  /**
   * Checks whether a given user is currently assigned.
   */
  isAssigned(userId: string): boolean {
    return this.selectedAssigneeIds.includes(userId);
  }

  /**
   * Returns uppercase initials derived from a full name.
   */
  getInitials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .map((namePart) => namePart[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Returns the contact object for a given user ID.
   */
  getContact(userId: string): Contact | null {
    return (this.contacts ?? []).find((contact) => contact.id === userId) ?? null;
  }

  /**
   * Returns the color associated with a contact.
   */
  getContactColor(userId: string): string {
    return this.getContact(userId)?.color ?? '#6c63ff';
  }

  /**
   * Returns the initials of a contact.
   */
  getContactInitials(userId: string): string {
    const contactName = this.getContact(userId)?.name ?? '';
    return this.getInitials(contactName);
  }

  /**
   * Adds a new subtask to the local subtask list.
   */
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

  /**
   * Clears the new subtask input field.
   */
  clearSubtaskInput(): void {
    this.newSubtaskTitle = '';
  }

  /**
   * Removes a subtask by its ID.
   */
  removeSubtask(subtaskId: string): void {
    this.subtasks = this.subtasks.filter((subtask) => subtask.id !== subtaskId);

    if (this.editSubtaskId === subtaskId) {
      this.cancelEditSubtask();
    }
  }

  /**
   * Starts editing an existing subtask.
   */
  startEditSubtask(subtaskId: string, title: string): void {
    this.editSubtaskId = subtaskId;
    this.editSubtaskTitle = title;
  }

  /**
   * Saves changes to an edited subtask.
   */
  saveEditSubtask(subtaskId: string): void {
    const trimmedTitle = this.editSubtaskTitle.trim();
    if (!trimmedTitle) return;

    this.subtasks = this.subtasks.map((subtask) => {
      if (subtask.id !== subtaskId) return subtask;
      return { ...subtask, title: trimmedTitle };
    });

    this.cancelEditSubtask();
  }

  /**
   * Cancels the current subtask edit operation.
   */
  cancelEditSubtask(): void {
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  /**
   * Generates a pseudo-random ID string.
   */
  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  /**
   * Builds a partial task object containing
   * all editable fields and derived values.
   *
   * @returns Partial task update payload
   */
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
