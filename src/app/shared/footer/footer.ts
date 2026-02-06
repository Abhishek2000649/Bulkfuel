import { Component } from '@angular/core';
import { Auth } from '../../core/services/Auth/authservice/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
 currentYear = new Date().getFullYear();

  constructor(public auth: Auth) {}
}
