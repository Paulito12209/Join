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
  // Reactive form group for Add Task dialog
  taskForm: FormGroup;
  title = '';
  description = '';
  dueDate = ''; // yyyy-mm-dd
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
        ...(this.subtasks.length ? { subtasks: this.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })) } : {}),
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

  addSubtask() {
    const t = this.newSubtaskTitle.trim();
    if (!t) return;
    this.subtasks.push({ id: this.randomId(), title: t, done: false });
    this.newSubtaskTitle = '';
  }

  toggleSubtask(id: string) {
    const s = this.subtasks.find(x => x.id === id);
    if (s) s.done = !s.done;
  }

  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter(s => s.id !== id);
  }

  // Toggle a contact id in assignedTo (checkboxes)
  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter(x => x !== id);
    this.taskForm.patchValue({ assignedTo: next });
  }

  assigneeOpen = false;
  toggleAssigneeDropdown(open: boolean) {
    this.assigneeOpen = open;
  }

  // Helpers for template (avoid arrow functions in bindings)
  getContact(uid: string): Contact | null {
    return this.contacts.find(c => c.id === uid) || null;
  }
  getContactColor(uid: string): string {
    const c = this.getContact(uid);
    return (c?.color as string) || '#6c63ff';
  }
  getContactName(uid: string): string {
    const c = this.getContact(uid);
    return c?.name || '';
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}



