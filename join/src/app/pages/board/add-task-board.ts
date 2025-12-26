import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ContactsService, Contact } from '../../core/services/contacts.service';

@Component({
  selector: 'app-add-task-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task-board.html',
  styleUrl: './add-task-board.scss',
})
export class AddTaskBoard {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  taskForm: FormGroup;

  priorities = ['Urgent', 'Medium', 'Low'];
  categories = ['Technical Task', 'User Story'];
  contacts: Contact[] = [];
  assigneeOpen = false;
  categoryOpen = false;
  isClosing = false;

  // Subtask logic
  public newSubtaskTitle = '';
  subtasks: { id: string; title: string; done: boolean }[] = [];
  editSubtaskId: string | null = null;
  editSubtaskTitle = '';
  subtaskFocus = false;

  constructor(private fb: FormBuilder, private contactsService: ContactsService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['Medium'], // Defaultwert gemäß Checkliste
      assignedTo: [[]],
      category: ['', Validators.required],
      subtask: [''],
    });
    this.contactsService.getContacts().subscribe(list => {
      this.contacts = list;
    });
  }

  // Subtask methods
  addSubtask() {
    console.log('Adding subtask', this.newSubtaskTitle);
    const t = this.newSubtaskTitle.trim();
    if (!t) return;
    this.subtasks.push({ id: this.randomId(), title: t, done: false });
    this.newSubtaskTitle = '';
  }

  clearSubtaskInput() {
    this.newSubtaskTitle = '';
  }

  removeSubtask(id: string) {
    this.subtasks = this.subtasks.filter(s => s.id !== id);
    if (this.editSubtaskId === id) {
      this.cancelEditSubtask();
    }
  }

  startEditSubtask(id: string, title: string) {
    this.editSubtaskId = id;
    this.editSubtaskTitle = title;
  }

  saveEditSubtask(id: string) {
    this.subtasks = this.subtasks.map(s => s.id === id ? { ...s, title: this.editSubtaskTitle } : s);
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  cancelEditSubtask() {
    this.editSubtaskId = null;
    this.editSubtaskTitle = '';
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  toggleAssignee(id: string, checked: boolean) {
    const current: string[] = this.taskForm.value.assignedTo || [];
    const next = checked ? Array.from(new Set([...current, id])) : current.filter(x => x !== id);
    this.taskForm.patchValue({ assignedTo: next });
  }

  isAssigned(id: string): boolean {
    return (this.taskForm.value.assignedTo || []).includes(id);
  }

  getContact(uid: string): Contact | null {
    return this.contacts.find(c => c.id === uid) || null;
  }
  getContactName(uid: string): string {
    return this.getContact(uid)?.name || '';
  }
  getContactColor(uid: string): string {
    return this.getContact(uid)?.color || '#6c63ff';
  }
  getContactInitials(uid: string): string {
    const name = this.getContact(uid)?.name || '';
    return this.getInitials(name);
  }
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  onClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 400);
  }

  onSubmit() {
    this.taskForm.markAllAsTouched();
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const payload = {
        ...formValue,
        subtasks: this.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })),
      };
      this.isClosing = true;
      setTimeout(() => {
        this.create.emit(payload);
        this.isClosing = false;
      }, 400);
    }
  }
}
