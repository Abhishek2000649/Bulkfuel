import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/Auth/authservice/auth';
import { filter, map, take } from 'rxjs';

export const guardGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return true;
  }
  return auth.user$.pipe(
    filter((user) => user !== null),
    take(1),
    map((user) => {
      switch (user.role) {
        case 'ADMIN':
          return router.createUrlTree(['/admin']);
        case 'USER':
          return router.createUrlTree(['/user']);
        case 'delivery_agent':
          return router.createUrlTree(['/delivery']);
        default:
          return router.createUrlTree(['/login']);
      }
    })
  );
};
