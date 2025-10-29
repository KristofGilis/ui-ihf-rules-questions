import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

performance.mark('app-bootstrap-start');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    performance.mark('app-bootstrap-end');
    performance.measure('app-bootstrap', 'app-bootstrap-start', 'app-bootstrap-end');
  })
  .catch((err) => {
    console.error('Application bootstrap failed:', err);
  });
