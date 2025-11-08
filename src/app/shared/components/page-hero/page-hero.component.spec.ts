import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeroComponent } from './page-hero.component';

describe('PageHeroComponent', () => {
  let component: PageHeroComponent;
  let fixture: ComponentFixture<PageHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Title Input', () => {
    it('should default to empty string', () => {
      expect(component.title()).toBe('');
    });

    it('should display provided title', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h1');
      expect(titleElement?.textContent?.trim()).toBe('Test Title');
    });

    it('should update title when input changes', () => {
      fixture.componentRef.setInput('title', 'Initial Title');
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let titleElement = compiled.querySelector('h1');
      expect(titleElement?.textContent?.trim()).toBe('Initial Title');

      fixture.componentRef.setInput('title', 'Updated Title');
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      titleElement = compiled.querySelector('h1');
      expect(titleElement?.textContent?.trim()).toBe('Updated Title');
    });
  });

  describe('Description Input', () => {
    it('should default to empty string', () => {
      expect(component.description()).toBe('');
    });

    it('should display provided description', () => {
      fixture.componentRef.setInput('description', 'Test description text');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const descElement = compiled.querySelector('p');
      expect(descElement?.textContent?.trim()).toBe('Test description text');
    });

    it('should have correct max-width class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const descElement = compiled.querySelector('p');
      expect(descElement?.classList.contains('max-w-2xl')).toBe(true);
    });
  });

  describe('Icon Input', () => {
    it('should default to false', () => {
      expect(component.icon()).toBe(false);
    });

    it('should not render icon container by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const iconContainer = compiled.querySelector('.rounded-3xl');
      expect(iconContainer).toBeNull();
    });

    it('should render icon container when icon is true', () => {
      fixture.componentRef.setInput('icon', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconContainer = compiled.querySelector('.rounded-3xl');
      expect(iconContainer).toBeTruthy();
    });

    it('should apply correct icon container classes', () => {
      fixture.componentRef.setInput('icon', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconContainer = compiled.querySelector('.rounded-3xl');
      expect(iconContainer?.classList.contains('inline-flex')).toBe(true);
      expect(iconContainer?.classList.contains('bg-linear-to-br')).toBe(true);
    });
  });

  describe('Badge Input', () => {
    it('should default to false', () => {
      expect(component.badge()).toBe(false);
    });

    it('should not render badge slot by default', () => {
      expect(component.badge()).toBe(false);
    });

    it('should allow badge slot when badge is true', () => {
      fixture.componentRef.setInput('badge', true);
      fixture.detectChanges();

      expect(component.badge()).toBe(true);
    });
  });

  describe('Size Input', () => {
    it('should default to "default"', () => {
      expect(component.size()).toBe('default');
    });

    it('should apply default size classes to h1', () => {
      fixture.componentRef.setInput('size', 'default');
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h1');
      expect(titleElement?.classList.contains('text-5xl')).toBe(true);
      expect(titleElement?.classList.contains('md:text-6xl')).toBe(true);
    });

    it('should apply small size classes to h1', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h1');
      expect(titleElement?.classList.contains('text-3xl')).toBe(true);
      expect(titleElement?.classList.contains('md:text-4xl')).toBe(true);
    });
  });

  describe('Template Structure', () => {
    it('should have correct container classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('div.mb-12.text-center');
      expect(container).toBeTruthy();
    });

    it('should have correct title base classes', () => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h1');
      expect(titleElement?.classList.contains('mb-3')).toBe(true);
      expect(titleElement?.classList.contains('font-black')).toBe(true);
      expect(titleElement?.classList.contains('tracking-tight')).toBe(true);
    });

    it('should have correct description classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const descElement = compiled.querySelector('p');
      expect(descElement?.classList.contains('mx-auto')).toBe(true);
      expect(descElement?.classList.contains('text-lg')).toBe(true);
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <app-page-hero [title]="'Test Title'" [icon]="true" [badge]="true">
          <div icon class="custom-icon">Custom Icon</div>
          <div badge class="custom-badge">Badge Content</div>
        </app-page-hero>
      `,
      imports: [PageHeroComponent],
    })
    class TestHostComponent {}

    it('should project custom icon content', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const customIcon = compiled.querySelector('.custom-icon');
      expect(customIcon?.textContent?.trim()).toBe('Custom Icon');
    });

    it('should project badge content when badge is true', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const customBadge = compiled.querySelector('.custom-badge');
      expect(customBadge?.textContent?.trim()).toBe('Badge Content');
    });
  });
});
