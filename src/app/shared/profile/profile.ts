import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from '../../core/services/Auth/profile/profile-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  user: any = {};
  address: any = {};
  isLoading:boolean=false;
  // visibility
  showBasic = true;     // ✅ default open
  showAddress = false;
  showPassword = false;

  passwordData = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  message = '';
  error = '';

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.openBasic(); // ✅ ensure basic tab opens
  }

  /* =========================
     LOAD PROFILE
  ========================= */
  loadProfile() {
    this.isLoading =true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.address = res.user.address ?? {};
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load profile';
      }
    });
  }

  /* =========================
     TAB CONTROLS
  ========================= */
  openBasic() {
    this.reset();
    this.showBasic = true;
  }

  openAddress() {
    this.reset();
    this.showAddress = true;
  }

  openPassword() {
    this.reset();
    this.showPassword = true;
  }

  reset() {
    this.showBasic = false;
    this.showAddress = false;
    this.showPassword = false;
    this.message = '';
    this.error = '';
  }

  /* =========================
     UPDATE BASIC
  ========================= */
  updateBasic() {
    this.isLoading= true;
    this.profileService.updateBasic({
      name: this.user.name,
      email: this.user.email,
    }).subscribe({
      next: (res) => {
        this.message = res.message;
        this.openBasic();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading= false;
        this.error = err.error?.message || 'Update failed';
        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     UPDATE ADDRESS
  ========================= */
  updateAddress() {
    this.isLoading= true;
    this.profileService.updateAddress(this.address).subscribe({
      next: (res) => {
        this.message = res.message;
        this.openAddress();
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading= false;
        this.error = 'Address update failed';
        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     UPDATE PASSWORD
  ========================= */
  updatePassword() {
    this.isLoading= true;
    this.profileService.updatePassword(this.passwordData).subscribe({
      next: (res) => {
        this.message = res.message;
        this.passwordData = {
          current_password: '',
          password: '',
          password_confirmation: ''
        };
        this.openPassword();
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading=false;
        this.error =
          err.error?.errors?.current_password?.[0] ||
          'Password update failed';
        this.cdr.detectChanges();
      }
    });
  }
}
