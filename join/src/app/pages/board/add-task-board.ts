import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ContactsService, Contact } from '../../core/services/contacts.service';

/**
 * Board-integrated task creation component.
 *
 * @remarks
 * Provides a lightweight task creation form used directly on the board.
 * Supports assignees, priorities, categories, subtasks, and emits events
 * for task creation and dialog closing.
 */
@Component({
  selector: 'app-add-task-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task-board.html',
  styleUrl: './add-task-board.scss',
})
export class AddTaskBoard {
  /**
   * Emits when the add-task overlay should be closed.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Emits when a new task has been created.
   */
  @Output() create = new EventEmitter<any>();

  /**
   * ISO date string (YYYY-MM-DD) representing today's date.
   */
  readonly today = new Date().toISOString().slice(0, 10);

  /**
   * Reactive form holding task input fields.
   */
  taskForm: FormGroup;

  /**
   * Available priority options.
   */
  priorities = ['Urgent', 'Medium', 'Low'];

  /**
   * Available task categories.
   */
  categories = ['Technical Task', 'User Story'];

  /**
   * List of available contacts for assignment.
   */
  contacts: Contact[] = [];

  /**
   * Indicates whether the assignee dropdown is open.
   */
  assigneeOpen = false;

  /**
   * Indicates whether the category dropdown is open.
   */
  categoryOpen = false;

  /**
   * Indicates whether the closing animation is active.
   */
  isClosing = false;

  /**
   * Controls visibility of the task-added toast.
   */
  showTaskAddedToast = false;

  /**
   * Temporary title for creating a new subtask.
   */
  newSubtaskTitle = '';

  /**
   * Local list of subtasks created for the task.
   */
  subtasks: { id: string; title: string; done: boolean }[] = [];

  /**
   * ID of the subtask currently being edited.
   */
  editSubtaskId: string | null = null;

  /**
   * Temporary title for editing a subtask.
   */
  editSubtaskTitle = '';

  /**
   * Indicates whether the subtask input currently has focus.
   */
  subtaskFocus = false;

  /**
   * Initializes the task form and loads contacts.
   */
  constructor(private fb: FormBuilder, private contactsService: ContactsService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['Medium'],
      assignedTo: [[]],
      category: ['', Validators.required],
      subtask: [''],
    });

    this.contactsService.getContacts().subscribe((list) => {
      this.contacts = list;
    });
  }

  /**
   * Adds a new subtask to the local subtask list.
   */
  addSubtask() {
    const t = this.newSubtaskTitle.trim();
    if (!t) return;
    this.subtasks.push({ id: this.randomId(), title: t, done: false });
    this.newSubtaskTitle = '';
  }

  /**
   * Clears the new subtask input field.
   */
  clearSubtaskInput() {
    this.newSubtaskTitle = '';
  }

  /**
   * Removes a subtask by its ID.
   */
  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter((s) => s.id !== id);
    if (this.editSubtaskId === id) {
      this.cancelEditSubtask();
    }
  }

  /**
   * Starts editing an existing subtask.
   */
  startEditSubtask(id: string, title: string) {
    this.editSubtaskId = id;
    this.editSubtaskTitle = title;
  }

  /**
   * Saves changes to an edited subtask.
   */
  saveEditSubtask(id: string) {
    this.subtasks = this.subtasks.map((s) =>
      s.id === id ? { ...s, title: this.editSubtaskTitle } : s
    );
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  /**
   * Cancels the current subtask edit operation.
   */
  cancelEditSubtask() {
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
   * Adds or removes an assignee from the task form.
   */
  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter((x) => x !== id);
    this.taskForm.patchValue({ assignedTo: next });
  }

  /**
   * Checks whether a contact is currently assigned.
   */
  isAssigned(id: string): boolean {
    return (this.taskForm.value.assignedTo || []).includes(id);
  }

  /**
   * Returns the contact object for a given user ID.
   */
  getContact(uid: string): Contact | null {
    return this.contacts.find((c) => c.id === uid) || null;
  }

  /**
   * Returns the contact name for a given user ID.
   */
  getContactName(uid: string): string {
    return this.getContact(uid)?.name || '';
  }

  /**
   * Returns the contact color for a given user ID.
   */
  getContactColor(uid: string): string {
    return this.getContact(uid)?.color || '#6c63ff';
  }

  /**
   * Returns the initials of a contact.
   */
  getContactInitials(uid: string): string {
    const name = this.getContact(uid)?.name || '';
    return this.getInitials(name);
  }

  /**
   * Returns uppercase initials derived from a name.
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Triggers the closing animation and emits the close event.
   */
  onClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 400);
  }

  /**
   * Validates the form and emits the created task payload.
   */
  onSubmit() {
    this.taskForm.markAllAsTouched();
    if (!this.taskForm.valid) return;

    const formValue = this.taskForm.value;
    const payload = {
      ...formValue,
      subtasks: this.subtasks.map((s) => ({
        id: s.id,
        title: s.title,
        done: s.done,
      })),
    };

    this.showTaskAddedToast = true;

    setTimeout(() => {
      this.create.emit(payload);
      this.close.emit();
      this.showTaskAddedToast = false;
    }, 900);
  }
}
