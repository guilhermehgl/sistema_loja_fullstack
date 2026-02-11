import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Inicializa a aplicacao Angular standalone com os providers globais.
bootstrapApplication(AppComponent, appConfig)
  // Falha de bootstrap deve aparecer no console para diagnostico local.
  .catch(err => console.error(err));
