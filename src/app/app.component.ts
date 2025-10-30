import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { getLanguage } from './language';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);

  constructor() {
    this._translateService.addLangs(['en', 'nl', 'srb']);
    const currentLang = getLanguage();
    this._translateService.use(currentLang);

    // Initialize theme service
    this._themeService.setTheme(this._themeService.theme());
  }
}
