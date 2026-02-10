import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/user/home/home-service';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Spinner],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  products: any[] = [];
  cart: Record<number, number> = {};
  isLoading:boolean=false;
  groupedProducts: {
    category_id: number;
    category_name: string;
    items: any[];
  }[] = [];

  constructor(
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHome();
  }

  loadHome() {
    this.isLoading=true;
    this.homeService.getHomeData().subscribe(res => {
      this.products = res.products || [];
      this.cart = res.cartItems || {};
      this.groupProductsByCategory();
      this.isLoading=false;
      this.cdr.detectChanges();
    });
  }

  groupProductsByCategory() {
    const map = new Map<number, any>();

    this.products.forEach(p => {
      const id = p.category?.id;
      const name = p.category?.name;

      if (!map.has(id)) {
        map.set(id, {
          category_id: id,
          category_name: name,
          items: []
        });
      }

      map.get(id).items.push(p);
    });

    this.groupedProducts = Array.from(map.values());
  }

  increase(p: any) {
    this.isLoading=true;
    if (!localStorage.getItem('token')) {
      this.isLoading=false;
      this.router.navigate(['/login']);
      return;
    }

    if ((this.cart[p.id] || 0) >= p.totalStock)
      {
        this.isLoading = false;
        return;
      } 

    this.homeService.updateCart(p.id, 'increase').subscribe(() => {
      this.cart = {
        ...this.cart,
        [p.id]: (this.cart[p.id] || 0) + 1
      };
      this.isLoading=false;
      this.cdr.detectChanges();
    });
  }

  decrease(p: any) {
    this.isLoading=true;
    if (!localStorage.getItem('token')) {
      this.isLoading=false;
      this.router.navigate(['/login']);
      return;
    }

    if (!this.cart[p.id]) 
      {
        this.isLoading=false;
        return;
      }

    this.homeService.updateCart(p.id, 'decrease').subscribe(() => {
      const qty = this.cart[p.id] - 1;

      if (qty <= 0) {
        const { [p.id]: _, ...rest } = this.cart;
        this.cart = rest;
      } else {
        this.cart = { ...this.cart, [p.id]: qty };
      }
      this.isLoading= false;
      this.cdr.detectChanges();
    });
  }

  goToCart() {
    this.isLoading=true;
    if (!localStorage.getItem('token')) {
      this.isLoading=false;
      this.router.navigate(['/login']);
      return;
    }

    for (let p of this.products) {
      if ((this.cart[p.id] || 0) > p.totalStock) {
        alert(`Please reduce quantity of ${p.name}. Only ${p.totalStock} available.`);
        this.isLoading=false;
        return;
      }
    }
    this.isLoading=false;
    this.router.navigate(['/user/cart']);
  }

  trackByProductId(index: number, item: any) {
    return item.id;
  }
}
