import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';

@Component({
  selector: 'app-home-warehouse',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-warehouse.html',
  styleUrl: './home-warehouse.css',
})
export class HomeWarehouse {


   warehouses: any[] = [];

  constructor(private adminService: Warehouse, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.adminService.getWarehouses().subscribe({
      next: (res) => {
        this.warehouses = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  deleteWarehouse(id: number) {
    if (!confirm('Are you sure you want to delete this warehouse?')) {
      return;
    }

    this.adminService.deleteWarehouse(id).subscribe({
      next: () => {
        this.loadWarehouses();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
