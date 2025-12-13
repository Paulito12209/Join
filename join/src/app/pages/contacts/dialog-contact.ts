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
// AsyncPipe not needed here

type Mode = 'create' | 'edit';

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

  /** Contact to edit (passed from parent). If null, creates new contact. */
  @Input() contact:
    | Contact
    | { id?: string; name: string; email?: string; phone?: string; color?: string }
    | null = null;

  /** Emits when dialog should be closed (cancel or after save) */
  @Output() closed = new EventEmitter<void>();
  /** Emits when a new contact was created (immediate UI update). */
  @Output() created = new EventEmitter<Contact>();
  /** Emits when an existing contact was updated (immediate UI update). */
  @Output('contact-updated') updated = new EventEmitter<Contact>();

  mode: Mode = 'create';
  contactId: string | null = null;
  loading = false;
  isClosing = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, fullNameValidator, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8,}$/)]],
  });

  async ngOnInit() {
    // Priority 1: Check if contact was passed via Input (overlay mode)
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

  cancel() {
    this.form.reset({ name: '', email: '', phone: '' });
    // Trigger closing animation; emit after 1000ms to match CSS duration
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.closed.emit();
    }, 400);
  }

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

  async remove() {
    if (this.mode !== 'edit' || !this.contactId) return;
    await this.contacts.deleteContact(this.contactId);
    this.cancel();
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts[1]?.charAt(0) ?? '';
    return `${first}${second}`.toUpperCase();
  }
}

// Custom Validators
export const fullNameValidator: ValidatorFn = (control: AbstractControl) => {
  const value = (control.value ?? '').toString().trim();
  if (!value) return null; // required handled separately
  // Require at least two name parts with letters (allowing spaces, hyphen, apostrophe)
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { fullName: true };
  const word = /^(?=.{2,})[A-Za-zÄÖÜäöüß'-]+$/;
  if (!word.test(parts[0]) || !word.test(parts[1])) return { fullName: true };
  return null;
};
