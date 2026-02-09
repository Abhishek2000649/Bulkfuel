import { HttpInterceptorFn } from '@angular/common/http';
import {environment} from '../../core/environments/environment'
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const apiUrl = environment.apiBaseUrl;
  if (token && req.url.startsWith(apiUrl)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }

  return next(req);
};
