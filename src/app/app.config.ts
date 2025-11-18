import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, LOCALE_ID } from '@angular/core'; // ⬅️ Añadir LOCALE_ID
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common'; // ⬅️ Añadir importación
import localeEs from '@angular/common/locales/es'; // ⬅️ Añadir importación de datos de 'es'

import { routes } from './app.routes';

// 1. Registra los datos del locale español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // 2. Establece el LOCALE_ID por defecto a 'es'
    { provide: LOCALE_ID, useValue: 'es' } // ⬅️ AÑADIR ESTA LÍNEA
  ]
};