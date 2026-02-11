import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Registra roteamento global e HttpClient para services.
    provideRouter(routes),
    provideHttpClient()
  ]
};
