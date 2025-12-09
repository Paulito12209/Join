import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
// import { Header } from './shared/header/header';
// import { Sidebar } from './shared/sidebar/sidebar';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Contacts, Sidebar],
  // imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}
