import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ContactsService, Contact as ContactModel } from '../../core/services/contacts.service';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogContact } from './dialog-contact';

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
  imports: [CommonModule, DialogContact],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  private readonly contactsSvc = inject(ContactsService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private _sub = new Subscription();
  showCreateToast = false;
  private toastTimeoutId: any;
  disableDetailAnimation = false;

  /** Controls whether the dialog modal is visible */
  showDialog = false;
  /** Contact being edited, null for create mode */
  editingContact: Contact | null = null;

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
          contacts: groups[letter].sort((a, b) =>
            a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
          ),
        }));
    })
  );

  selectedContact: Contact | null = null;

  showActions = false;

  toggleActions() {
    this.showActions = !this.showActions;
  }

  selectContact(contact: Contact) {
    this.disableDetailAnimation = false;

    this.selectedContact = contact;

    document.querySelector('.contact-detail')?.classList.add('visible');

    this.showActions = false;
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  addContact() {
    this.showActions = false;  // <- hinzugefügt
    this.editingContact = null;
    this.showDialog = true;
  }

  editContact() {
    const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;
    this.showActions = false;  // <- hinzugefügt
    this.editingContact = c;
    this.showDialog = true;
  }

  /** Called when dialog is closed or saved */
  onDialogClose() {
    this.showDialog = false;
    this.editingContact = null;
  }

  async deleteContact() {
    const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;
    await this.contactsSvc.deleteContact(c.id);
    this.selectedContact = null;

    this.showActions = false;

    const detailEl = document.querySelector('.contact-detail');
    detailEl?.classList.remove('visible');
  }

  ngOnInit() {
    this._sub.add(
      this.contacts$.subscribe((list) => {
        if (this.selectedContact && !list.find((x) => x.id === this.selectedContact!.id)) {
          this.selectedContact = null;
        }
      })
    );
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  closeDetail() {
    this.selectedContact = null;
    this.showActions = false;
    const detailEl = document.querySelector('.contact-detail');
    detailEl?.classList.remove('visible');
  }

  onContactCreated(contact: ContactModel) {
    this.disableDetailAnimation = true;
    this.selectedContact = contact;
    document.querySelector('.contact-detail')?.classList.add('visible');

    this.showCreateToast = true;
    this.cdr.detectChanges();

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.showCreateToast = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  onContactUpdated(contact: ContactModel) {
    if (!contact?.id) return;
    if (this.selectedContact && this.selectedContact.id === contact.id) {
      this.selectedContact = {
        ...this.selectedContact,
        ...contact,
      } as Contact;
      document.querySelector('.contact-detail')?.classList.add('visible');
      this.cdr.detectChanges();
    }
  }

  closeActionsPanel() {
    this.showActions = false;
  }
}
