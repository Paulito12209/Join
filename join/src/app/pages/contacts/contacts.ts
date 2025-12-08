import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Contact {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-contacts',
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  contacts: Contact[] = [
    { name: 'Anna Müller', email: 'anna@example.com', phone: '123456789' },
    { name: 'Ben Schröder', email: 'ben@example.com', phone: '234567891' },
    { name: 'Clara Neumann', email: 'clara@example.com', phone: '345678912' },
    { name: 'Daniel Werner', email: 'daniel@example.com', phone: '987654321' },
  ];

  selectedContact: Contact | null = null;

  get groupedContacts() {
    const groups: { [letter: string]: Contact[] } = {};
    this.contacts.forEach((c) => {
      const letter = c.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        letter,
        contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
