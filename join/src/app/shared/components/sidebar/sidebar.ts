import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs/operators';
import { MainNav } from './main-nav/main-nav';
import { LegalNav } from './legal-nav/legal-nav';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Sidebar component for the main navigation.
 * Displays the logo, main navigation links (Summary, Board, Add Task, Contacts),
 * and legal navigation links (Privacy Policy, Legal Notice).
 * Conditionally shows/hides navigation based on login state.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, MainNav, LegalNav],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  /** Service for authentication state */
  private authService = inject(AuthService);

  /** Observable that emits true if a user is logged in */
  isLoggedIn$ = this.authService.user$.pipe(map((user) => !!user));
}
