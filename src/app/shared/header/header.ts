import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/Auth/authservice/auth';
import Swal from 'sweetalert2';
import { Spinner } from '../spinner/spinner';
import { AdminOrder } from '../../core/services/admin/AdminOrder/admin-order';
import { ProfileService } from '../../core/services/Auth/profile/profile-service';
import { Location } from '../../core/services/location/location';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spinner],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {

  searchQuery: string = '';

  isMobileMenuOpen = false;
  isProfileOpen = false;
  isSettingsOpen = false;
  orderCount: number = 0;
  isLoading:boolean = false;
  user: any = null;
  isDropdownOpen = false;
  currentAddress:any;
  constructor(
    public auth: Auth,
    private router: Router,
    private adminService: AdminOrder,
    private cdr:ChangeDetectorRef,
    private profileService: ProfileService,
    private locationService: Location,
  ) {}
  ngOnInit(): void {
  this.loadOrderCount();
   this.locationService.currentAddress$.subscribe((data: any) => {
    this.currentAddress = data;
  });

  // 🔄 auto refresh (optional but recommended)
  setInterval(() => {
    this.loadOrderCount();
    this.cdr.detectChanges();
  }, 5000);
}

  statusPriority: { [key: string]: number } = {
  PENDING: 1,
  CONFIRMED: 2,
  PACKED: 3,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  CANCELLED: 7,
}; 

loadOrderCount() {
  this.adminService.getOrders().subscribe({
    next: (res: any) => {
      const orders = res?.data || [];

      this.orderCount = orders.filter((order: any) =>
        this.statusPriority[order.status] <
        this.statusPriority['SHIPPED']
      ).length;
    },
    error: (err) => {
      console.error('Order count error', err);
    }
  });
}

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
this.isLoading= true;
  this.closeAll();

  this.auth.logout().subscribe({

    next: (res: any) => {
      this.isLoading= false;
      this.cdr.detectChanges();

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
      this.isLoading= false;
      this.cdr.detectChanges();
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
getShortAddress(address: string): string {
  if (!address) return 'No Address';

  const words = address.split(' ');
  return words.length > 4
    ? words.slice(0, 4).join(' ') + '...'
    : address;
}

}
