import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden" style="background-color: var(--surface-color); border-color: var(--border-color);">
      <div class="flex justify-around items-center h-16">
        <a
          routerLink="/home"
          routerLinkActive="active-nav-link"
          class="flex flex-col items-center justify-center flex-1 h-full nav-link"
          [attr.aria-label]="'navigation.home' | translate">
          <i class="fas fa-home text-xl mb-1"></i>
          <span class="text-xs">{{ 'navigation.home' | translate }}</span>
        </a>

        <a
          routerLink="/quiz"
          routerLinkActive="active-nav-link"
          class="flex flex-col items-center justify-center flex-1 h-full nav-link"
          [attr.aria-label]="'navigation.quiz' | translate">
          <i class="fas fa-graduation-cap text-xl mb-1"></i>
          <span class="text-xs">{{ 'navigation.quiz' | translate }}</span>
        </a>

        <a
          routerLink="/rules"
          routerLinkActive="active-nav-link"
          class="flex flex-col items-center justify-center flex-1 h-full nav-link"
          [attr.aria-label]="'navigation.rules' | translate">
          <i class="fas fa-book text-xl mb-1"></i>
          <span class="text-xs">{{ 'navigation.rules' | translate }}</span>
        </a>

        <a
          routerLink="/questions"
          routerLinkActive="active-nav-link"
          class="flex flex-col items-center justify-center flex-1 h-full nav-link"
          [attr.aria-label]="'navigation.questions' | translate">
          <i class="fas fa-question-circle text-xl mb-1"></i>
          <span class="text-xs">{{ 'navigation.questions' | translate }}</span>
        </a>
      </div>
    </nav>
  `,
  styles: [
    `
      .nav-link {
        color: var(--text-secondary-color);
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .nav-link:hover {
        color: var(--text-color);
      }

      .active-nav-link {
        color: var(--color-primary);
        font-weight: 600;
      }
    `,
  ],
})
export class BottomNavComponent {}
