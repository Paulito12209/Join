import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Navigation Service
 * 
 * Tracks navigation history by monitoring Angular Router events.
 * Maintains the current and previous URLs to enable navigation-based logic.
 * 
 * **Use Cases:**
 * - Implementing "back" navigation with context awareness
 * - Conditional UI rendering based on navigation source
 * - Analytics and user flow tracking
 * - Breadcrumb generation
 * 
 * **Behavior:**
 * - Automatically subscribes to router events on service initialization
 * - Updates URL history on every successful navigation (NavigationEnd event)
 * - Uses `urlAfterRedirects` to capture the final URL after any redirects
 * 
 * @injectable
 * 
 * @example
 * // Inject the service
 * constructor(private navService: NavigationService) {}
 * 
 * // Check where the user came from
 * const previousUrl = this.navService.getPreviousUrl();
 * if (previousUrl === '/login') {
 *   console.log('User just logged in');
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  /** The URL before the current navigation, null if this is the first navigation */
  private previousUrl: string | null = null;
  /** The current URL after the most recent navigation */
  private currentUrl: string | null = null;

  /**
   * Initializes the service and subscribes to router navigation events.
   * 
   * @param router - Angular Router instance for monitoring navigation
   */
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  /**
   * Returns the URL of the previous navigation.
   * 
   * @returns The previous URL string, or null if this is the first navigation or no previous URL exists
   * 
   * @example
   * const prevUrl = this.navService.getPreviousUrl();
   * if (prevUrl) {
   *   console.log(`User navigated from: ${prevUrl}`);
   * }
   */
  getPreviousUrl(): string | null {
    return this.previousUrl;
  }
}
