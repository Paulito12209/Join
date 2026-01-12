import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

/**
 * Help page component.
 *
 * @remarks
 * Provides navigation logic for returning the user to the previously
 * visited route. If no previous route is available, the user is redirected
 * to the summary page.
 */
@Component({
  selector: 'app-help',
  standalone: true,
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  /**
   * Angular Router instance used for programmatic navigation.
   */
  private router = inject(Router);

  /**
   * Service that stores and provides the previously visited route.
   */
  private navigationService = inject(NavigationService);

  /**
   * Navigates the user back to the previous route.
   *
   * @remarks
   * If a previous URL is available via the NavigationService,
   * navigation will return to that route. Otherwise, the user
   * is redirected to the summary page as a fallback.
   */
  goBack(): void {
    const previousUrl = this.navigationService.getPreviousUrl();

    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
      return;
    }

    this.router.navigate(['/summary']);
  }
}
