import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faQuestionCircle, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { LogoComponent } from '../../../logo/logo.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, TranslatePipe, LogoComponent],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  readonly faHome = faHome;
  readonly faQuestionCircle = faQuestionCircle;
  readonly faBookOpen = faBookOpen;

  navItems = [
    { path: '/home', icon: this.faHome, label: 'navigation.home' },
    { path: '/questions', icon: this.faQuestionCircle, label: 'navigation.questions' },
    { path: '/rules', icon: this.faBookOpen, label: 'navigation.rules' },
  ];
}
