import { Injectable } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, runTransaction } from 'firebase/firestore';
import { Observable } from 'rxjs';

/** Sort field for contacts (currently only `name`). */
export type SortBy = 'name';
/** Sort direction: ascending or descending. */
export type SortDir = 'asc' | 'desc';

/** Contact record stored in Firestore and used by the UI. */
export interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
}

/**
 * Contacts Service
 * 
 * Provides CRUD operations for managing contacts in Firestore.
 * 
 * **Features:**
 * - Real-time contact list with sorting capabilities
 * - Automatic name capitalization
 * - Color-coded avatars with round-robin palette assignment
 * - Thread-safe color assignment using Firestore transactions
 * 
 * **Color Assignment:**
 * Each new contact is automatically assigned a color from a predefined palette.
 * Colors are assigned sequentially and cycle through the palette using a
 * global counter stored in Firestore, ensuring consistent colors across all clients.
 * 
 * @injectable
 * 
 * @example
 * // Inject the service
 * constructor(private contactsService: ContactsService) {}
 * 
 * // Get all contacts
 * this.contactsService.getContacts('name', 'asc').subscribe(contacts => {
 *   console.log('Contacts:', contacts);
 * });
 * 
 * // Create a new contact
 * await this.contactsService.createContact({
 *   name: 'john doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890'
 * });
 */
@Injectable({ providedIn: 'root' })
export class ContactsService {
  /** Firestore collection reference for `contacts`. */
  private readonly colRef;
  /** Doc reference for global counters (palette sequencing). */
  private readonly countersDoc;

  /**
   * Avatar color palette (matching `styles.scss`). Colors are assigned in
   * sequence on creation.
   */
  private readonly avatarPalette: string[] = [
    '#ff7a00',
    '#9327ff',
    '#ff745e',
    '#ffc701',
    '#ffe62b',
    '#ff5eb3',
    '#00bee8',
    '#ffa35e',
    '#0038ff',
    '#ff4646',
    '#6e52ff',
    '#1fd7c1',
    '#fc71ff',
    '#c3ff2b',
    '#ffbb2b',
  ];

  /**
   * Initializes the Firestore `contacts` collection.
   * @param firestore Injected AngularFire Firestore instance.
   */
  constructor(private readonly firestore: Firestore) {
    this.colRef = collection(this.firestore, 'contacts');
    this.countersDoc = doc(this.firestore, 'meta', 'counters');
  }

  /**
   * Returns an observable list of contacts sorted by `name`.
   * @param sortBy Sort field (only `name`).
   * @param sortDir Sort direction (`asc` or `desc`).
   */
  getContacts(sortBy: SortBy = 'name', sortDir: SortDir = 'asc'): Observable<Contact[]> {
    const field = 'name';
    const q = query(this.colRef, orderBy(field as string, sortDir));
    return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
  }

  /**
   * Creates a contact: capitalizes the name and assigns the next palette color.
   * @param input Minimum contact data with required `name`.
   * @returns The document ID of the created contact.
   */
  async createContact(input: Pick<Contact, 'name'> & Partial<Contact>): Promise<Contact> {
    const fixedName = this.capitalizeName(input.name);
    const index = await this.nextPaletteIndex();
    const payload: any = {
      name: fixedName,
      color: this.avatarPalette[index]
    };

    // Only add email and phone if they are defined
    if (input.email?.trim()) {
      payload.email = input.email.trim();
    }
    if (input.phone?.trim()) {
      payload.phone = input.phone.trim();
    }

    const ref = await addDoc(this.colRef, payload);

    return {
      id: ref.id,
      ...payload,
    };
  }

  /**
   * Updates an existing contact. If `name` is provided, it will be capitalized.
   * Color remains unchanged.
   * @param id Contact document ID.
   * @param patch Partial update fields.
   */
  async updateContact(id: string, patch: Partial<Contact>): Promise<void> {
    const d = doc(this.firestore, 'contacts', id);
    const newName = patch.name ? this.capitalizeName(patch.name) : undefined;
    const cleaned = {
      ...(newName ? { name: newName } : {}),
      ...(patch.email ? { email: patch.email.trim() } : {}),
      ...(patch.phone ? { phone: patch.phone.trim() } : {}),
    };
    await updateDoc(d, cleaned as any);
  }

  /**
   * Deletes a contact by document ID.
   * @param id Contact document ID.
   */
  async deleteContact(id: string): Promise<void> {
    const d = doc(this.firestore, 'contacts', id);
    await deleteDoc(d);
  }

  /**
   * Capitalizes a full name: each word starts uppercase, remaining letters lowercase.
   * Collapses multiple spaces.
   * @param name Unformatted name.
   * @returns Capitalized name string.
   */
  private capitalizeName(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Returns the next palette index in round-robin order, stored in Firestore.
   * Uses a transaction for concurrency safety across clients.
   */
  private async nextPaletteIndex(): Promise<number> {
    const len = this.avatarPalette.length;
    return runTransaction(this.firestore, async (tx) => {
      const snap = await tx.get(this.countersDoc as any);
      let next = 0;
      if (snap.exists()) {
        const seq = ((snap.data() as any)?.avatarSeq ?? 0) as number;
        next = (seq + 1) % len;
        tx.update(this.countersDoc as any, { avatarSeq: next });
      } else {
        next = 0;
        tx.set(this.countersDoc as any, { avatarSeq: next });
      }
      return next;
    });
  }
}
