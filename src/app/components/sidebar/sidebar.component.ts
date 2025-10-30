import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LogoComponent } from '../../logo/logo.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LogoComponent],
  template: `
    <aside class="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:left-0 md:top-0 border-r" style="background-color: var(--surface-color); border-color: var(--border-color);">
      <!-- Logo -->
      <div class="flex justify-center items-center p-6 border-b" style="border-color: var(--border-color);">
        <app-logo class="w-32 h-auto" />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <a
          routerLink="/home"
          routerLinkActive="active-nav-link"
          class="flex items-center gap-3 px-4 py-3 rounded-lg nav-link"
          [attr.aria-label]="'navigation.home' | translate">
          <i class="fas fa-home text-lg w-5"></i>
          <span>{{ 'navigation.home' | translate }}</span>
        </a>

        <a
          routerLink="/rules"
          routerLinkActive="active-nav-link"
          class="flex items-center gap-3 px-4 py-3 rounded-lg nav-link"
          [attr.aria-label]="'navigation.rules' | translate">
          <i class="fas fa-book text-lg w-5"></i>
          <span>{{ 'navigation.rules' | translate }}</span>
        </a>

        <a
          routerLink="/questions"
          routerLinkActive="active-nav-link"
          class="flex items-center gap-3 px-4 py-3 rounded-lg nav-link"
          [attr.aria-label]="'navigation.questions' | translate">
          <i class="fas fa-question-circle text-lg w-5"></i>
          <span>{{ 'navigation.questions' | translate }}</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t text-xs" style="border-color: var(--border-color); color: var(--text-secondary-color);">
        <p class="font-semibold">&copy; Copyright 2025, Kristof Gilis</p>
      </div>
    </aside>
  `,
  styles: [
    `
      .nav-link {
        color: var(--text-color);
        text-decoration: none;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .nav-link:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      :root.dark .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .active-nav-link {
        background-color: var(--color-primary);
        color: white;
        font-weight: 600;
      }

      .active-nav-link:hover {
        background-color: var(--color-primary-hover);
      }
    `,
  ],
})
export class SidebarComponent {}
