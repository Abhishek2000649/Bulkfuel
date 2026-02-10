import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-home-warehouse',
  imports: [RouterModule, CommonModule, Spinner],
  templateUrl: './home-warehouse.html',
  styleUrl: './home-warehouse.css',
})
export class HomeWarehouse {


   warehouses: any[] = [];
  isLoading:boolean=false;
  constructor(private adminService: Warehouse, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.isLoading=true;
    this.adminService.getWarehouses().subscribe({
      next: (res) => {
        this.warehouses = res;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

  deleteWarehouse(id: number) {
    this.isLoading=true;
    if (!confirm('Are you sure you want to delete this warehouse?')) {
      this.isLoading=false;
      return;
    }

    this.adminService.deleteWarehouse(id).subscribe({
      next: () => {
        this.isLoading=false;
        this.loadWarehouses();
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
