import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/Auth/authservice/auth';
import Swal from 'sweetalert2';

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

      if (res?.success || res?.status) {

        Swal.fire({
          title: res?.message || "Logout successful",
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        });

        localStorage.removeItem('token');

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);

      } else {

        // अगर backend success false दे दे
        Swal.fire({
          title: res?.message || 'Logout failed',
          icon: 'error'
        });

      }

    },

    error: (err: any) => {

      let title = 'Error';
      
      // 🔴 Backend not running
      if (err.status === 0) {
        title = 'Server not running';
      }

      // 🔴 Unauthorized (Token expired)
      else if (err.status === 401) {
        title = err.error?.message || 'Session expired. Please login again.';
        localStorage.removeItem('token');
        this.router.navigate(['/']);
      }

      // 🔴 Other backend errors
      else {
        title = err.error?.message || 'Something went wrong';
      }

      Swal.fire({
        title: title,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });

      console.error('Logout failed', err);
    }

  });
}

}
