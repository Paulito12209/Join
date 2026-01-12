import { Component, inject } from '@angular/core';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Header } from '../../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

/**
 * Main Layout Component
 * 
 * The primary layout wrapper for the authenticated application.
 * Provides the structural foundation for all main application pages.
 * 
 * **Structure:**
 * - Sidebar: Navigation menu on the left (collapsible on mobile)
 * - Header: Top bar with user information and actions
 * - RouterOutlet: Dynamic content area where routed components are displayed
 * 
 * **Usage:**
 * This layout is typically applied to routes that require authentication
 * and need the standard application chrome (sidebar + header).
 * 
 * **Responsive Behavior:**
 * - Desktop: Sidebar visible, header spans remaining width
 * - Mobile: Sidebar hidden by default, toggleable via hamburger menu
 * 
 * @component
 * 
 * @example
 * // In routing configuration
 * {
 *   path: '',
 *   component: MainLayout,
 *   canActivate: [authGuard],
 *   children: [
 *     { path: 'summary', component: SummaryComponent },
 *     { path: 'contacts', component: ContactsComponent },
 *     { path: 'board', component: BoardComponent }
 *   ]
 * }
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  /** Navigation service for tracking URL history (injected for potential future use) */
  private navigationService = inject(NavigationService);
}
