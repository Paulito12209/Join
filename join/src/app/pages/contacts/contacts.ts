import { AsyncPipe, CommonModule } from '@angular/common';
import { Component,inject } from '@angular/core';
import { ContactsService, Contact as ContactModel } from '../../core/services/contacts.service';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})

export class Contacts {
  private readonly contactsSvc = inject(ContactsService);
  private readonly router = inject(Router);

  contacts$ = this.contactsSvc.getContacts('name', 'asc');

    grouped$ = this.contacts$.pipe(
    map((contacts: ContactModel[]) => {
      const groups: Record<string, ContactModel[]> = {};
      for (const c of contacts) {
        const letter = (c.name?.charAt(0) || '').toUpperCase();
        if (!letter) continue;
        (groups[letter] ??= []).push(c);
      }
      return Object.keys(groups)
        .sort()
        .map((letter) => ({
          letter,
          contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })),
        }));
    })
  );


selectedContact: Contact | null = null;


  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  addContact() {
    this.router.navigate(['/contacts', 'add']);
  }

  editContact() {
    const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;
    this.router.navigate(['/contacts', c.id, 'edit']);
  }

  async deleteContact() {
   const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;
    await this.contactsSvc.deleteContact(c.id);
    this.selectedContact = null;
  }
}
