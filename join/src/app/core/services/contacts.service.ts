import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, collectionData, query, orderBy, getDocs } from '@angular/fire/firestore';
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

/** Service providing CRUD operations for `contacts` in Firestore. */
@Injectable({ providedIn: 'root' })
export class ContactsService {
  /** Firestore collection reference for `contacts`. */
  private readonly colRef;

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
    const snap = await getDocs(this.colRef as any);
    const index = snap.size % this.avatarPalette.length;
    const payload: Omit<Contact, 'id'> = {
      name: fixedName,
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      color: this.avatarPalette[index]
    };
    const ref = await addDoc(this.colRef, payload as any);

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
}
