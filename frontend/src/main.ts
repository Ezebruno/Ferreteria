// Punto de entrada principal de la aplicación Angular
// Inicializa y arranca el componente raíz de la aplicación
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
