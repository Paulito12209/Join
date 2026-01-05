import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-legal-notes',
  standalone: true,
  templateUrl: './legal-notes.html',
  styleUrl: './legal-notes.scss',
})
export class LegalNotes {
  private router = inject(Router);
  private navigationService = inject(NavigationService);

  goBack(): void {
    const previousUrl = this.navigationService.getPreviousUrl();

    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
      return;
    }

    this.router.navigate(['/login']);
  }
}

