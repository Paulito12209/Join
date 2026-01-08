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

/** Service providing CRUD operations for `contacts` in Firestore. */
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
    '$color-avatar-01',
    '$color-avatar-02',
    '$color-avatar-03',
    '$color-avatar-04',
    '$color-avatar-05',
    '$color-avatar-06',
    '$color-avatar-07',
    '$color-avatar-08',
    '$color-avatar-09',
    '$color-avatar-10',
    '$color-avatar-11',
    '$color-avatar-12',
    '$color-avatar-13',
    '$color-avatar-14',
    '$color-avatar-15',
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
