import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from './core/services/Auth/authservice/auth';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,     NgxSpinnerModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
   standalone: true, 
})
export class App {
  constructor(private auth: Auth, private router: Router) {}
  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.auth.me().subscribe({
        next: () => {},
        error: (err) => {
          console.log(err);

          localStorage.clear();
          this.router.navigate(['/login']);
        },
      });
    }
  }

  protected readonly title = signal('Bulk-fuel-web');
}
