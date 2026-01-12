import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { ContactsService, Contact } from '../../core/services/contacts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

type Mode = 'create' | 'edit';

/**
 * Dialog component for creating and editing contacts.
 *
 * @remarks
 * Supports both overlay-based usage via input bindings and
 * route-based usage via URL parameters. Emits events to inform
 * parent components about create, update, and close actions.
 */
@Component({
  selector: 'app-dialog-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dialog-contact.html',
  styleUrls: ['./dialog-contact.scss'],
})
export class DialogContact {
  private fb = inject(FormBuilder);
  private contacts = inject(ContactsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /**
   * Contact data to edit.
   *
   * @remarks
   * If null, the dialog operates in create mode.
   */
  @Input() contact:
    | Contact
    | { id?: string; name: string; email?: string; phone?: string; color?: string }
    | null = null;

  /**
   * Emits when the dialog should be closed.
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Emits when a new contact has been created.
   */
  @Output() created = new EventEmitter<Contact>();

  /**
   * Emits when an existing contact has been updated.
   */
  @Output('contact-updated') updated = new EventEmitter<Contact>();

  /**
   * Current dialog mode.
   */
  mode: Mode = 'create';

  /**
   * ID of the contact currently being edited.
   */
  contactId: string | null = null;

  /**
   * Indicates whether a save or delete operation is in progress.
   */
  loading = false;

  /**
   * Indicates whether the closing animation is active.
   */
  isClosing = false;

  /**
   * Reactive form for contact data.
   */
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, fullNameValidator, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8,}$/)]],
  });

  /**
   * Initializes the dialog state based on input data or route parameters.
   */
  async ngOnInit() {
    if (this.contact && 'id' in this.contact && this.contact.id) {
      this.mode = 'edit';
      this.contactId = this.contact.id;
      this.form.patchValue({
        name: this.contact.name || '',
        email: this.contact.email || '',
        phone: this.contact.phone || '',
      });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.contactId = id;
      try {
        const list = await firstValueFrom(this.contacts.getContacts('name', 'asc'));
        const found = (list || []).find((c) => c.id === id) || null;
        if (found) {
          this.form.patchValue({
            name: found.name || '',
            email: found.email || '',
            phone: found.phone || '',
          });
        }
      } catch {}
    } else {
      this.mode = 'create';
    }
  }

  /**
   * Cancels the dialog and triggers the closing animation.
   */
  cancel() {
    this.form.reset({ name: '', email: '', phone: '' });
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.closed.emit();
    }, 400);
  }

  /**
   * Submits the form and creates or updates a contact.
   */
  async submit() {
    if (this.loading) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name.trim(),
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined,
    };

    try {
      if (this.mode === 'edit' && this.contactId) {
        await this.contacts.updateContact(this.contactId, payload);
        const merged: Contact = {
          id: this.contactId,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          color:
            (this.contact && 'color' in this.contact ? this.contact.color : undefined) || undefined,
        };
        this.updated.emit(merged);
      } else {
        const created = await this.contacts.createContact(payload);
        this.created.emit(created);
      }
      this.cancel();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Deletes the currently edited contact.
   */
  async remove() {
    if (this.mode !== 'edit' || !this.contactId) return;
    await this.contacts.deleteContact(this.contactId);
    this.cancel();
  }

  /**
   * Returns uppercase initials derived from a contact name.
   */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts[1]?.charAt(0) ?? '';
    return `${first}${second}`.toUpperCase();
  }
}

/**
 * Validator ensuring that a full name with at least two parts is provided.
 */
export const fullNameValidator: ValidatorFn = (control: AbstractControl) => {
  const value = (control.value ?? '').toString().trim();
  if (!value) return null;

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { fullName: true };

  const word = /^(?=.{2,})[A-Za-zÄÖÜäöüß'-]+$/;
  if (!word.test(parts[0]) || !word.test(parts[1])) return { fullName: true };

  return null;
};
