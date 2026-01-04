import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isUserMenuOpen = false;
  userInitials$ = this.authService.user$.pipe(
    map(user => {
      if (user && user.displayName) {
        return this.getInitials(user.displayName);
      } else if (user && user.isAnonymous) {
        return 'G';
      }
      return 'G';
    })
  );

  constructor() { }

  ngOnInit() { }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click')
  closeMenuOnAnyClick() {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
