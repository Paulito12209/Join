import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { TasksService } from '../../core/services/tasks.service';
import { Task } from './task';
import { ContactsService, Contact } from '../../core/services/contacts.service';


@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.scss'],
})
export class AddTask {
  /**
   * Add Task page component.
   *
   * Provides a reactive form to compose a new task, select assignees via
   * a chip-based dropdown, manage subtasks, and submit the task to Firestore
   * using `TasksService`.
   */
  // Reactive form group for Add Task dialog
  taskForm: FormGroup;
  /** Title input model (legacy usage in update path) */
  title = '';
  /** Description input model (legacy usage in update path) */
  description = '';
  /** Due date for update path in yyyy-mm-dd */
  dueDate = '';
  status: Task['status'] = 'todo';
  priority: Task['priority'] = 'medium';
  category: Task['category'] = 'user-story';
  // Options for priority buttons
  priorities: Task['priority'][] = ['urgent', 'medium', 'low'];
  contacts: Contact[] = [];
  selectedAssigneeIds: string[] = [];

  // Subtasks
  newSubtaskTitle = '';
  subtasks: { id: string; title: string; done: boolean }[] = [];

  saving = false;
  resultMsg = '';

  
  editId: string | null = null;

  /**
   * Build the reactive form and subscribe to contacts for the assignee picker.
   */
  constructor(private tasks: TasksService, private contactsService: ContactsService, private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['medium'],
      assignedTo: [[]],
      category: ['', Validators.required],
      subtask: [''],
    });
    this.contactsService.getContacts().subscribe(list => {
      this.contacts = list;
    });
  }

  /**
   * Create a new task from the form values.
   * - Validates required fields (title, dueDate, category)
   * - Maps `assignedTo` ids to `assignees` objects with uid/name/email
   * - Persists the task via `TasksService.create`
   */
  async createTask() {
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
        subtask: string;
      };
      const subtasksArray = this.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done }));
      // Falls im Eingabefeld "subtask" noch Text steht, diesen ebenfalls als Subtask übernehmen
      if (form.subtask && form.subtask.trim()) {
        subtasksArray.push({ id: this.randomId(), title: form.subtask.trim(), done: false });
      }
      const payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: form.title.trim(),
        description: (form.description || '').trim(),
        status: this.status,
        priority: form.priority,
        category: form.category,
        assignees: this.contacts
          .filter(c => (form.assignedTo || []).includes(c.id!))
          .map(c => ({ uid: c.id!, name: c.name, email: c.email })),
        ...(form.dueDate ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
        ...(subtasksArray.length ? { subtasks: subtasksArray } : {}),
      };
      const created = await this.tasks.create(payload);
      this.resultMsg = `Created: ${created.id}`;
      this.clearForm();
    } catch (e: any) {
      this.resultMsg = 'Error: ' + e?.message;
    } finally {
      this.saving = false;
    }
  }
  /**
   * Update an existing task using the legacy update path (edit mode).
   * Requires `editId` to be set via `setEditTarget`.
   */
  async updateTask() {
    if (!this.editId) {
      this.resultMsg = 'No task ID set for editing.';
      return;
    }
    if (!this.title.trim()) {
      this.resultMsg = 'Please fill in the title.';
      return;
    }

    this.saving = true;
    this.resultMsg = '';
    try {
      const patch: Partial<Task> = {
        title: this.title.trim(),
        description: this.description.trim(),
        status: this.status,
        priority: this.priority,
        category: this.category,
        assignees: this.contacts
          .filter(c => this.selectedAssigneeIds.includes(c.id!))
          .map(c => ({ uid: c.id!, name: c.name, email: c.email })),
        ...(this.dueDate ? { dueDate: new Date(this.dueDate).toISOString() } : {}),
        ...(this.subtasks.length ? { subtasks: this.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })) } : {}),
      };

      const updated = await this.tasks.update(this.editId, patch);
      this.resultMsg = updated ? `Updated: ${updated.id}` : 'Update failed.';

      this.clearForm();
      this.editId = null;
    } catch (e: any) {
      this.resultMsg = 'Error: ' + e?.message;
    } finally {
      this.saving = false;
    }
  }

  /**
   * Delete a task by id.
   * @param id Firestore document id to delete
   */
  async deleteTask(id: string) {
    if (!id) {
      this.resultMsg = 'No task ID for deletion.';
      return;
    }
    this.saving = true;
    this.resultMsg = '';
    try {
      await this.tasks.remove(id);
      this.resultMsg = `Deleted: ${id}`;
      if (this.editId === id) {
        this.editId = null;
        this.clearForm();
      }
    } catch (e: any) {
      this.resultMsg = 'Error: ' + e?.message;
    } finally {
      this.saving = false;
    }
  }

  // Hilfsfunktion: einen Task zur Bearbeitung setzen und Formular befüllen
  // Du kannst sie aufrufen, wenn der Nutzer eine Task aus der Liste auswählt.
  /**
   * Enter edit mode and populate the reactive form from an existing task.
   * @param id Firestore document id
   * @param task The task payload used to prefill the form
   */
  setEditTarget(id: string, task: Task) {
    this.editId = id;
    this.taskForm.patchValue({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      priority: task.priority || 'medium',
      assignedTo: (task.assignees || []).map(a => a.uid),
      category: task.category || 'user-story',
    });
    this.status = task.status || 'todo';
    this.subtasks = (task.subtasks || []).map(s => ({ id: s.id, title: s.title, done: !!s.done }));
  }

  /**
   * Reset the reactive form and transient UI state to defaults.
   */
  clearForm() {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: [],
      category: 'user-story',
      subtask: '',
    });
    this.status = 'todo';
    this.subtasks = [];
    this.newSubtaskTitle = '';
  }

  /**
   * Add a subtask based on `newSubtaskTitle` content.
   * Ignores empty/whitespace-only entries.
   */
  addSubtask() {
    const t = this.newSubtaskTitle.trim();
    if (!t) return;
    this.subtasks.push({ id: this.randomId(), title: t, done: false });
    this.newSubtaskTitle = '';
  }

  /**
   * Toggle a subtask's completion state by id.
   * @param id Local subtask id
   */
  toggleSubtask(id: string) {
    const s = this.subtasks.find(x => x.id === id);
    if (s) s.done = !s.done;
  }

  /**
   * Remove a subtask by id from the local list.
   * @param id Local subtask id
   */
  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter(s => s.id !== id);
  }

  // Toggle a contact id in assignedTo (checkboxes)
  /**
   * Add or remove a contact uid to/from the `assignedTo` array in the form.
   * @param id Contact uid
   * @param checked Whether the contact should be present in the selection
   */
  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter(x => x !== id);
    this.taskForm.patchValue({ assignedTo: next });
  }

  assigneeOpen = false;
  /**
   * Open/close the assignee dropdown overlay.
   * @param open True to open, false to close
   */
  toggleAssigneeDropdown(open: boolean) {
    this.assigneeOpen = open;
  }

  // Helpers for template (avoid arrow functions in bindings)
  /**
   * Resolve a contact by uid from the cached contacts list.
   * @param uid Contact uid
   * @returns The contact or null if not found
   */
  getContact(uid: string): Contact | null {
    return this.contacts.find(c => c.id === uid) || null;
  }
  /**
   * Get a contact's color or a fallback color if not provided.
   * @param uid Contact uid
   */
  getContactColor(uid: string): string {
    const c = this.getContact(uid);
    return (c?.color as string) || '#6c63ff';
  }
  /**
   * Get a contact's display name or an empty string.
   * @param uid Contact uid
   */
  getContactName(uid: string): string {
    const c = this.getContact(uid);
    return c?.name || '';
  }

  /**
   * Create a random local id for new subtasks.
   */
  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}



