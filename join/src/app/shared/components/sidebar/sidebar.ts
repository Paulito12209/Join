import { Component } from '@angular/core';
import { MainNav } from './main-nav/main-nav';
import { LegalNav } from './legal-nav/legal-nav';

@Component({
  selector: 'app-sidebar',
  imports: [MainNav, LegalNav],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

}
