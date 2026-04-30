import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-warehouse',
  imports: [RouterModule, CommonModule, Spinner],
  templateUrl: './home-warehouse.html',
  styleUrl: './home-warehouse.css',
})
export class HomeWarehouse {


  warehouses: any[] = [];
  isLoading: boolean = false;
  constructor(private adminService: Warehouse, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.isLoading = true;

    this.adminService.getWarehouses().subscribe({
      next: (res: any) => {
        this.warehouses = res?.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: err.error?.message || 'Failed to load warehouses',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });
      },
    });
  }

  deleteWarehouse(id: number) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this warehouse?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#6b7280',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#facc15'
    }).then((result) => {

      if (result.isConfirmed) {

        this.isLoading = true;

        this.adminService.deleteWarehouse(id).subscribe({

          next: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
            Swal.fire({
              title: 'Deleted Successfully!',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d4af37',
              background: 'linear-gradient(135deg, #3b0000, #1a0000)',
              color: '#ffffff',
              iconColor: '#22c55e'
            });

            this.loadWarehouses();
          },

          error: (err) => {
            this.isLoading = false;
            this.cdr.detectChanges();

            Swal.fire({
              title: err.error?.message || 'Delete failed',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d4af37',
              background: 'linear-gradient(135deg, #3b0000, #1a0000)',
              color: '#ffffff',
              iconColor: '#ef4444'
            });
          },

        });

      }

    });

  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
