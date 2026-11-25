import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Spanish month/day names and number format for the date and number pipes
// (English 'en-US' ships with Angular).
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
