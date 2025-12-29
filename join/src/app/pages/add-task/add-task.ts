import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
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

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.scss'],
})
export class AddTask {
  taskForm: FormGroup;

  status: Task['status'] = 'todo';

  readonly priorities = ['Urgent', 'Medium', 'Low'] as const;
  priorityIcons: Record<(typeof this.priorities)[number], string> = {
    Urgent: 'img/icons/prio-urgent.svg',
    Medium: 'img/icons/prio-medium.svg',
    Low: 'img/icons/prio-low.svg',
  };

  contacts: Contact[] = [];
  assigneeOpen = false;

  newSubtaskTitle = '';
  subtasks: { id: string; title: string; done: boolean }[] = [];
  editSubtaskId: string | null = null;
  editSubtaskTitle = '';
  subtaskFocus = false;

  saving = false;
  resultMsg = '';

  showTaskAddedToast = false;
  hideToast = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private tasks: TasksService,
    private contactsService: ContactsService,
    private fb: FormBuilder
  ) {
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
      };

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
        ...(form.dueDate ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
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
      this.clearForm();

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
      }, 1500);
    } catch (e: any) {
      this.resultMsg = 'Error: ' + e?.message;
    } finally {
      this.saving = false;
    }
  }

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

  startEditSubtask(id: string, title: string) {
    this.editSubtaskId = id;
    this.editSubtaskTitle = title;
  }

  saveEditSubtask(id: string) {
    this.subtasks = this.subtasks.map((s) =>
      s.id === id ? { ...s, title: this.editSubtaskTitle } : s
    );
    this.cancelEditSubtask();
  }

  cancelEditSubtask() {
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter((s) => s.id !== id);
    if (this.editSubtaskId === id) {
      this.cancelEditSubtask();
    }
  }

  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter((x) => x !== id);

    this.taskForm.patchValue({ assignedTo: next });
  }

  toggleAssigneeDropdown(state?: boolean) {
    this.assigneeOpen = state !== undefined ? state : !this.assigneeOpen;
  }

  getContact(uid: string): Contact | null {
    return this.contacts.find((c) => c.id === uid) || null;
  }

  getContactName(uid: string): string {
    return this.getContact(uid)?.name || '';
  }

  getContactColor(uid: string): string {
    return this.getContact(uid)?.color || '#6c63ff';
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}
