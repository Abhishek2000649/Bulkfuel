import { Component } from '@angular/core';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(private auth: Auth, private router: Router) {}

  logout() {
    this.auth.logout().subscribe({
      next: (res) => {
        if (res.status) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
