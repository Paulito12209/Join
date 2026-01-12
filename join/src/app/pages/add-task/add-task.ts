/**
 * AddTask Component
 *
 * Responsibilities:
 * - Provide a form for creating new tasks
 * - Validate required task fields
 * - Manage task metadata (priority, category, status)
 * - Assign contacts to a task
 * - Manage subtasks (add, edit, remove)
 * - Persist tasks via TasksService
 * - Show visual feedback (toast) after successful creation
 * - Redirect to the board after task creation
 *
 * Implemented as a standalone Angular component using Reactive Forms.
 */

import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { TasksService } from '../../core/services/tasks.service';
import { Task } from './task';
import { ContactsService, Contact } from '../../core/services/contacts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.scss'],
})
export class AddTask {
  /** Reactive form for task creation */
  taskForm: FormGroup;

  /** Initial task status */
  status: Task['status'] = 'todo';

  /** Date helpers */
  readonly today = new Date().toISOString().slice(0, 10);

  /** Priority configuration */
  readonly priorities = ['Urgent', 'Medium', 'Low'] as const;
  priorityIcons: Record<(typeof this.priorities)[number], string> = {
    Urgent: 'img/icons/prio-urgent.svg',
    Medium: 'img/icons/prio-medium.svg',
    Low: 'img/icons/prio-low.svg',
  };

  /** Contacts and assignee dropdown state */
  contacts: Contact[] = [];
  assigneeOpen = false;

  /** Subtask management */
  newSubtaskTitle = '';
  subtasks: { id: string; title: string; done: boolean }[] = [];
  editSubtaskId: string | null = null;
  editSubtaskTitle = '';
  subtaskFocus = false;

  /** UI feedback state */
  saving = false;
  resultMsg = '';

  /** Success toast state */
  showTaskAddedToast = false;
  hideToast = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Change detection */
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private tasks: TasksService,
    private contactsService: ContactsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    /**
     * Initialize reactive form with default values and validators.
     */
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['Medium'],
      assignedTo: [[]],
      category: ['', Validators.required],
      subtask: [''],
    });

    /**
     * Load available contacts for task assignment.
     */
    this.contactsService.getContacts().subscribe((list) => {
      this.contacts = list;
    });
  }

  /**
   * Global click handler
   *
   * Closes the assignee dropdown when clicking outside of it.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.assigned-dropdown')) {
      this.assigneeOpen = false;
    }
  }

  /**
   * Creates a new task
   *
   * Flow:
   * 1. Validate form
   * 2. Build task payload
   * 3. Persist task via TasksService
   * 4. Show success toast
   * 5. Navigate to board
   */
  async createTask() {
    this.taskForm.markAllAsTouched();
    if (this.taskForm.invalid) {
      this.resultMsg = 'Please fill required fields.';
      return;
    }

    this.saving = true;
    this.resultMsg = '';

    try {
      const form = this.taskForm.value as {
        title: string;
        description: string;
        dueDate: string;
        priority: Task['priority'];
        assignedTo: string[];
        category: Task['category'];
      };

      /**
       * Build task payload without server-generated fields.
       */
      const payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: form.title.trim(),
        description: (form.description || '').trim(),
        status: this.status,
        priority: form.priority,
        category: form.category,
        assignees: this.contacts
          .filter((c) => (form.assignedTo || []).includes(c.id!))
          .map((c) => ({
            uid: c.id!,
            name: c.name,
            email: c.email,
          })),
        ...(form.dueDate
          ? { dueDate: new Date(form.dueDate).toISOString() }
          : {}),
        ...(this.subtasks.length
          ? {
              subtasks: this.subtasks.map((s) => ({
                id: s.id,
                title: s.title,
                done: s.done,
              })),
            }
          : {}),
      };

      const created = await this.tasks.create(payload);
      this.resultMsg = `Created: ${created.id}`;

      /**
       * Show success toast and navigate after animation.
       */
      this.showTaskAddedToast = true;
      this.hideToast = false;
      this.cdr.detectChanges();

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.hideToast = true;
        this.cdr.detectChanges();
      }, 1000);

      setTimeout(() => {
        this.showTaskAddedToast = false;
        this.cdr.detectChanges();

        this.router.navigate(['/board']).then(() => {
          this.clearForm();
          this.cdr.detectChanges();
        });
      }, 1500);
    } catch (e: any) {
      this.resultMsg = 'Error: ' + e?.message;
    } finally {
      this.saving = false;
    }
  }

  /**
   * Resets the entire form and related UI state.
   */
  clearForm() {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      assignedTo: [],
      category: 'user-story',
      subtask: '',
    });

    this.status = 'todo';
    this.subtasks = [];
    this.newSubtaskTitle = '';
    this.cancelEditSubtask();
    this.subtaskFocus = false;
  }

  /**
   * Subtask creation
   */
  addSubtask() {
    const t = this.newSubtaskTitle.trim();
    if (!t) return;

    this.subtasks.push({
      id: this.randomId(),
      title: t,
      done: false,
    });

    this.newSubtaskTitle = '';
  }

  clearSubtaskInput() {
    this.newSubtaskTitle = '';
  }

  /**
   * Subtask editing
   */
  startEditSubtask(subtaskId: string, title: string): void {
    this.editSubtaskId = subtaskId;
    this.editSubtaskTitle = title;
  }

  saveEditSubtask(subtaskId: string): void {
    const trimmedTitle = this.editSubtaskTitle.trim();
    if (!trimmedTitle) return;

    this.subtasks = this.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, title: trimmedTitle }
        : subtask
    );

    this.cancelEditSubtask();
  }

  cancelEditSubtask(): void {
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter((s) => s.id !== id);
    if (this.editSubtaskId === id) {
      this.cancelEditSubtask();
    }
  }

  /**
   * Assignee handling
   */
  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked
      ? Array.from(new Set([...current, id]))
      : current.filter((x) => x !== id);

    this.taskForm.patchValue({ assignedTo: next });
  }

  isAssigned(id: string): boolean {
    return (this.taskForm.value.assignedTo || []).includes(id);
  }

  toggleAssigneeDropdown(state?: boolean) {
    this.assigneeOpen = state !== undefined ? state : !this.assigneeOpen;
  }

  /**
   * Contact helper methods (used for UI rendering)
   */
  getContact(uid: string): Contact | null {
    return this.contacts.find((c) => c.id === uid) || null;
  }

  getContactName(uid: string): string {
    return this.getContact(uid)?.name || '';
  }

  getContactColor(uid: string): string {
    return this.getContact(uid)?.color || '#6c63ff';
  }

  getContactInitials(uid: string): string {
    return this.getInitials(this.getContact(uid)?.name || '');
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Generates a lightweight random ID for subtasks.
   */
  private randomId(): string {
    return (
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2)
    );
  }
}
