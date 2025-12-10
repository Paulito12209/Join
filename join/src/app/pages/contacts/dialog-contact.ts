import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactsService, Contact } from '../../core/services/contacts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-dialog-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dialog-contact.html',
  styleUrls: ['./dialog-contact.scss']
})
export class DialogContact {
  private fb = inject(FormBuilder);
  private contacts = inject(ContactsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mode: Mode = 'create';
  contactId: string | null = null;
  contact: Contact | null = null;
  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [''],
    phone: ['']
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const pathLast = this.route.snapshot.url.at(-1)?.path ?? '';
    if (id && pathLast === 'edit') {
      this.mode = 'edit';
      this.contactId = id;
      try {
        const list = await this.contacts.getContacts().toPromise();
        this.contact = (list || []).find(c => c.id === id) || null;
        if (this.contact) {
          this.form.patchValue({
            name: this.contact.name || '',
            email: this.contact.email || '',
            phone: this.contact.phone || ''
          });
        }
      } catch {}
    } else {
      this.mode = 'create';
    }
  }

  cancel() {
    this.form.reset({ name: '', email: '', phone: '' });
    this.router.navigate(['/']);
  }

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name.trim(),
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined
    };
    try {
      if (this.mode === 'edit' && this.contactId) {
        await this.contacts.updateContact(this.contactId, payload);
      } else {
        await this.contacts.createContact(payload);
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
}
