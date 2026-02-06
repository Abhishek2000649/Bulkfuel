import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/Auth/authservice/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {

  searchQuery: string = '';

  isMobileMenuOpen = false;
  isProfileOpen = false;
  isSettingsOpen = false;

  constructor(
    public auth: Auth,
    private router: Router
  ) {}

  // ================= PROFILE =================
  toggleProfile(event: Event): void {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
    this.isSettingsOpen = false;
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  closeAll(): void {
    this.isProfileOpen = false;
    this.isSettingsOpen = false;
    this.isMobileMenuOpen = false;
  }

  // ================= OUTSIDE CLICK =================
  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.closeAll();
  }

  // ================= MOBILE =================
  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // ================= LOGOUT =================
  logout(): void {
    this.closeAll();

    this.auth.logout().subscribe({
      next: (res: any) => {
        if (res?.status) {
          localStorage.removeItem('token');
          this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        console.error('Logout failed', err);
      }
    });
  }
}
