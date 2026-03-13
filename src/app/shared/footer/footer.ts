import { Component } from '@angular/core';
import { Auth } from '../../core/services/Auth/authservice/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
 currentYear = new Date().getFullYear();

  constructor(public auth: Auth) {}
}
