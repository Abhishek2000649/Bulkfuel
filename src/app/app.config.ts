import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { NgxSpinnerModule } from 'ngx-spinner';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // 🔥 MUST
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes),

    // ✅ ngx-spinner provider
    importProvidersFrom(
      NgxSpinnerModule.forRoot({ type: 'ball-spin-clockwise' })
    )
  ]
};
