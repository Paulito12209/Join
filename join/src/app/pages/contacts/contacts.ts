import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ContactsService, Contact as ContactModel } from '../../core/services/contacts.service';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogContact } from './dialog-contact';
import { AuthService } from '../../core/services/auth.service';

/**
 * Represents a contact in the application.
 * @interface Contact
 */
interface Contact {
  /** Unique identifier for the contact (optional for new contacts) */
  id?: string;
  /** Full name of the contact */
  name: string;
  /** Email address of the contact */
  email?: string;
  /** Phone number of the contact */
  phone?: string;
  /** Background color for the contact's avatar circle (hex format) */
  color?: string;
}

/**
 * Contacts Component
 * 
 * Manages the contacts page of the application, including:
 * - Displaying a list of contacts grouped alphabetically
 * - Showing detailed information for selected contacts
 * - Creating, editing, and deleting contacts via a dialog
 * - Identifying the currently logged-in user with a "(YOU)" label
 * - Responsive design with mobile-specific UI elements
 * 
 * @component
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, DialogContact],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  /** Service for managing contacts data */
  private readonly contactsSvc = inject(ContactsService);
  /** Router for navigation */
  private readonly router = inject(Router);
  /** Change detector for manual change detection */
  private readonly cdr = inject(ChangeDetectorRef);
  /** Authentication service to get current user information */
  private readonly authSvc = inject(AuthService);
  /** Subscription manager for observables */
  private _sub = new Subscription();
  /** Controls visibility of the "Contact successfully created" toast message */
  showCreateToast = false;
  /** Timeout ID for hiding the create toast message */
  private toastTimeoutId: any;
  /** Disables slide-in animation for contact detail view when true */
  disableDetailAnimation = false;
  /** Disables slide-in animation for mobile actions panel when true */
  disableActionsAnimation = false;

  /** Controls whether the dialog modal is visible */
  showDialog = false;
  /** Contact being edited, null for create mode */
  editingContact: Contact | null = null;

  /** Observable stream of all contacts sorted by name in ascending order */
  contacts$ = this.contactsSvc.getContacts('name', 'asc');

  /** Current logged-in user's email */
  currentUserEmail$ = this.authSvc.user$.pipe(
    map(user => user?.email || null)
  );

  /**
   * Observable stream of contacts grouped alphabetically by first letter.
   * Each group contains a letter and an array of contacts sorted by name.
   * Uses German locale for sorting with case-insensitive comparison.
   */
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

  /** Currently selected contact for detail view, null if none selected */
  selectedContact: Contact | null = null;

  /** Controls visibility of the mobile actions panel (edit/delete buttons) */
  showActions = false;

  /**
   * Toggles the visibility of the mobile actions panel.
   * Used on mobile devices to show/hide edit and delete buttons.
   */
  toggleActions() {
    this.showActions = !this.showActions;
  }

  /**
   * Selects a contact and displays its details in the detail view.
   * Enables the slide-in animation and hides the mobile actions panel.
   * 
   * @param contact - The contact to select and display
   */
  selectContact(contact: Contact) {
    this.disableDetailAnimation = false;

    this.selectedContact = contact;

    document.querySelector('.contact-detail')?.classList.add('visible');

    this.showActions = false;
  }

  /**
   * Generates initials from a contact's name.
   * Takes the first letter of each word in the name.
   * 
   * @param name - The full name of the contact
   * @returns The initials as a string (e.g., "John Doe" -> "JD")
   */
  getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  /**
   * Checks if a contact is the currently logged-in user.
   * Performs case-insensitive email comparison.
   * 
   * @param contactEmail - The email address of the contact to check
   * @param currentUserEmail - The email address of the currently logged-in user
   * @returns True if the contact is the current user, false otherwise
   */
  isCurrentUser(contactEmail: string | undefined, currentUserEmail: string | null): boolean {
    if (!contactEmail || !currentUserEmail) return false;
    return contactEmail.toLowerCase() === currentUserEmail.toLowerCase();
  }

  /**
   * Opens the contact dialog in create mode.
   * Hides the mobile actions panel and clears any editing contact.
   */
  addContact() {
    this.showActions = false;
    this.editingContact = null;
    this.showDialog = true;
  }

  /**
   * Opens the contact dialog in edit mode for the currently selected contact.
   * Does nothing if no contact is selected or if the contact has no ID.
   * Hides the mobile actions panel.
   */
  editContact() {
    const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;
    this.showActions = false;
    this.editingContact = c;
    this.showDialog = true;
  }

  /** Called when dialog is closed or saved */
  onDialogClose() {
    this.showDialog = false;
    this.editingContact = null;
  }

  /**
   * Deletes the currently selected contact.
   * Disables animations during deletion, removes the contact from the database,
   * clears the selection, and hides the detail view.
   * Does nothing if no contact is selected or if the contact has no ID.
   */
  async deleteContact() {
    this.disableActionsAnimation = true;
    this.showActions = false;

    const c = this.selectedContact;
    if (!c || !('id' in c) || !c.id) return;

    await this.contactsSvc.deleteContact(c.id);

    this.selectedContact = null;

    const detailEl = document.querySelector('.contact-detail');
    detailEl?.classList.remove('visible');

    this.disableActionsAnimation = false;
  }

  /**
   * Angular lifecycle hook called after component initialization.
   * Subscribes to contacts changes and clears selection if the selected contact is deleted.
   */
  ngOnInit() {
    this._sub.add(
      this.contacts$.subscribe((list) => {
        if (this.selectedContact && !list.find((x) => x.id === this.selectedContact!.id)) {
          this.selectedContact = null;
        }
      })
    );
  }

  /**
   * Angular lifecycle hook called before component destruction.
   * Unsubscribes from all observables to prevent memory leaks.
   */
  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  /**
   * Closes the contact detail view.
   * Clears the selected contact, hides the actions panel, and removes the visible class.
   * Used primarily on mobile devices when navigating back to the contacts list.
   */
  closeDetail() {
    this.selectedContact = null;
    this.showActions = false;
    const detailEl = document.querySelector('.contact-detail');
    detailEl?.classList.remove('visible');
  }

  /**
   * Callback handler when a new contact is successfully created.
   * Selects the newly created contact, shows it in the detail view without animation,
   * and displays a success toast message for 2 seconds.
   * 
   * @param contact - The newly created contact
   */
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

  /**
   * Callback handler when a contact is successfully updated.
   * If the updated contact is currently selected, refreshes its data in the detail view.
   * 
   * @param contact - The updated contact
   */
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

  /**
   * Closes the mobile actions panel.
   * Temporarily disables animation to prevent visual glitches when closing via overlay click.
   */
  closeActionsPanel() {
    this.showActions = false;
    this.disableActionsAnimation = true;
    this.disableActionsAnimation = false;
  }
}
