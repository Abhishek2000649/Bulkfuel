import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import { required } from '@angular/forms/signals';
import Swal from 'sweetalert2';
type UserManagementFormFields = 'name' | 'email' | 'role';
@Component({
  selector: 'app-edit-user-management',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Spinner],
  templateUrl: './edit-user-management.html',
  styleUrl: './edit-user-management.css',
})
export class EditUserManagement {
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  userForm!: FormGroup;
  userId!: number;
  errors: string[] = [];

  isLoading: boolean = false;
  formErrors: Record<UserManagementFormFields, string> = {
    name: '',
    email: '',
    role: '',

  };
  validationMessages: Record<UserManagementFormFields, any> = {
    name: {
      required: 'Enter name',
      pattern: 'Enter valid name',
    },
    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },
    role: {
      required: 'select any role',
    }
  };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: UserManagement,
    private cdr: ChangeDetectorRef,
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    }, {
    });
    this.userForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }


  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadUser();
  }
  updateFormErrors(): void {
    (Object.keys(this.formErrors) as UserManagementFormFields[]).forEach((field) => {
      const control = this.userForm.get(field);
      this.formErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formErrors[field] = messages[errorKey];
            break;
          }
        }
      }
    });
  }
  loadUser() {
    this.isLoading = true;

    this.adminService.getUserById(this.userId).subscribe({

      next: (res: any) => {

        const role = res?.data?.role || res.role;

        this.userForm.patchValue({
          name: res?.data?.name || res.name,
          email: res?.data?.email || res.email,
          role: role
        });

        this.selectedRole = role;

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err: any) => {

        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: err.error?.message || 'Failed to load user',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });

      }

    });
  }


  onSubmit() {

    this.isLoading = true;

    // 🔹 Form validation check
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.errors = [];

    this.adminService.updateUser(this.userId, this.userForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        // ✅ SUCCESS
        next: (res: any) => {

          Swal.fire({
            title: res?.message || 'User updated successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e'
          }).then(() => {
            this.router.navigate(['/admin/userManagement']);
          });

        },

        // ❌ ERROR
        error: (err: any) => {

          Swal.fire({
            title: err.error?.message || 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });

          console.error(err);
        }

      });

  }

  isDropdownOpen = false;

  roles = ['ADMIN', 'USER', 'delivery_agent'];

  selectedRole: string | null = null;


  // Toggle dropdown
  toggleDropdown(event: Event): void {

    event.stopPropagation();

    this.isDropdownOpen = !this.isDropdownOpen;

  }


  // Select role
  selectRole(role: string, event: Event): void {

    event.stopPropagation();

    this.selectedRole = role;

    this.isDropdownOpen = false;

    // Update reactive form
    this.userForm.patchValue({
      role: role
    });

  }


  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {

    const target = event.target as HTMLElement;

    if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(target)) {

      this.isDropdownOpen = false;

    }

  }


}
