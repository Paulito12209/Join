import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';
import { filter, map, startWith } from 'rxjs';

/**
 * Header component displayed at the top of the application.
 * Contains the logo, help link, and user menu with logout functionality.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  /** Service for authentication operations */
  private authService = inject(AuthService);
  /** Angular Router for navigation */
  private router = inject(Router);

  /** Controls visibility of the user dropdown menu */
  isUserMenuOpen = false;
  /** Observable that emits true if a user is logged in */
  isLoggedIn$ = this.authService.user$.pipe(map((user) => !!user));

  /** Observable that emits the user's initials (or 'G' for guests) */
  userInitials$ = this.authService.user$.pipe(
    map((user) => {
      if (user && user.displayName) {
        return this.getInitials(user.displayName);
      } else if (user && user.isAnonymous) {
        return 'G';
      }
      return 'G';
    })
  );

  /** Observable that emits true if current route is the help page */
  isHelpPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => this.router.url.startsWith('/help'))
  );

  /**
   * Toggles the user dropdown menu visibility.
   * @param event - Mouse event to stop propagation
   */
  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  /**
   * Closes the user menu when clicking anywhere on the document.
   * Decorated with @HostListener to listen for document clicks.
   */
  @HostListener('document:click')
  closeMenuOnAnyClick(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  /**
   * Signs out the current user and navigates to the login page.
   */
  logout(): void {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
      this.isUserMenuOpen = false;
    });
  }

  /**
   * Extracts initials from a full name.
   * @param name - Full name of the user
   * @returns Initials (max. 2 characters, uppercase)
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
