import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs/operators';
import { MainNav } from './main-nav/main-nav';
import { LegalNav } from './legal-nav/legal-nav';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, MainNav, LegalNav],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);

  isLoggedIn$ = this.authService.user$.pipe(map((user) => !!user));
}
