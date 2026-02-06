import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/Auth/authservice/auth';
import { filter, map, take } from 'rxjs';

export const authGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }
    return auth.user$.pipe(
      filter((user) => user !== null),
      take(1),
      map((user) => {
        if (allowedRoles.includes(user.role)) {
          return true;
        }
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
};
