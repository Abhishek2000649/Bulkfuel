import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/user/home/home-service';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

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
  isLoading: boolean = false;
  groupedProducts: {
    category_id: number;
    category_name: string;
    items: any[];
  }[] = [];

  constructor(
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadHome();
  }
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    setTimeout(() => {
      const video = this.heroVideo?.nativeElement;

      if (video) {
        video.muted = true;
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
        });
      }
    }, 500); // small delay for DOM stability
  }

  loadHome() {
    this.isLoading = true;

    this.homeService.getHomeData().subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.cart = res.cartItems || {};
        this.groupProductsByCategory();
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to load products';

        Swal.fire({
          title: message,
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
    this.isLoading = true;

    if (!localStorage.getItem('token')) {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
      return;
    }

    if ((this.cart[p.id] || 0) >= p.totalStock) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.homeService.updateCart(p.id, 'increase').subscribe({
      next: () => {
        this.cart = {
          ...this.cart,
          [p.id]: (this.cart[p.id] || 0) + 1
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to update cart';

        Swal.fire({
          title: message,
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
  onImageError(event: any) {
    event.target.src = 'https://picsum.photos/400/300';
  }

  decrease(p: any) {
    this.isLoading = true;

    if (!localStorage.getItem('token')) {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
      return;
    }

    if (!this.cart[p.id]) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.homeService.updateCart(p.id, 'decrease').subscribe({
      next: () => {
        const qty = this.cart[p.id] - 1;

        if (qty <= 0) {
          const { [p.id]: _, ...rest } = this.cart;
          this.cart = rest;
        } else {
          this.cart = { ...this.cart, [p.id]: qty };
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to update cart';

        Swal.fire({
          title: message,
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

  goToCart() {
    this.isLoading = true;

    // 1️⃣ Not Logged In
    if (!localStorage.getItem('token')) {
      this.isLoading = false;
      this.cdr.detectChanges();


      this.router.navigate(['/login']);
    }

    // 2️⃣ Stock Validation
    for (let p of this.products) {
      if ((this.cart[p.id] || 0) > p.totalStock) {
        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: `Please reduce quantity of ${p.name}. Only ${p.totalStock} available.`,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        return;
      }
    }


    this.isLoading = false;
    this.cdr.detectChanges();


    this.router.navigate(['/user/cart']);
  }

  trackByProductId(index: number, item: any) {
    return item.id;
  }

  scrollToProducts() {
    const element = document.getElementById('products');
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
