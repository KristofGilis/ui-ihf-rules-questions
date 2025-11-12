import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageContainerComponent } from './page-container.component';

describe('PageContainerComponent', () => {
  let component: PageContainerComponent;
  let fixture: ComponentFixture<PageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Gradient Input', () => {
    it('should default to true', () => {
      expect(component.gradient()).toBe(true);
    });

    it('should apply gradient background classes by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const outerDiv = compiled.querySelector('div');
      expect(outerDiv?.className).toContain('bg-linear-to-br');
      expect(outerDiv?.className).toContain('from-slate-50');
      expect(outerDiv?.className).not.toContain('bg-slate-50 dark:bg-slate-950');
    });

    it('should apply solid background when gradient is false', () => {
      fixture.componentRef.setInput('gradient', false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const outerDiv = compiled.querySelector('div');
      expect(outerDiv?.className).toContain('bg-slate-50 dark:bg-slate-950');
      expect(outerDiv?.className).not.toContain('bg-linear-to-br');
    });

    it('should apply min-h-screen class regardless of gradient', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const outerDiv = compiled.querySelector('div');
      expect(outerDiv?.classList.contains('min-h-screen')).toBe(true);

      fixture.componentRef.setInput('gradient', false);
      fixture.detectChanges();
      expect(outerDiv?.classList.contains('min-h-screen')).toBe(true);
    });
  });

  describe('MaxWidth Input', () => {
    it('should default to "max-w-5xl"', () => {
      expect(component.maxWidth()).toBe('max-w-5xl');
    });

    it('should apply default max-width class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('max-w-5xl')).toBe(true);
    });

    it('should apply custom max-width class', () => {
      fixture.componentRef.setInput('maxWidth', 'max-w-7xl');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('max-w-7xl')).toBe(true);
    });

    it('should update max-width when input changes', () => {
      fixture.componentRef.setInput('maxWidth', 'max-w-3xl');
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('max-w-3xl')).toBe(true);

      fixture.componentRef.setInput('maxWidth', 'max-w-full');
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('max-w-full')).toBe(true);
    });
  });

  describe('Padding Input', () => {
    it('should default to "py-12 pb-24"', () => {
      expect(component.padding()).toBe('py-12 pb-24');
    });

    it('should apply default padding classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('py-12')).toBe(true);
      expect(innerDiv?.classList.contains('pb-24')).toBe(true);
    });

    it('should apply custom padding classes', () => {
      fixture.componentRef.setInput('padding', 'py-8 pb-16');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('py-8')).toBe(true);
      expect(innerDiv?.classList.contains('pb-16')).toBe(true);
    });

    it('should update padding when input changes', () => {
      fixture.componentRef.setInput('padding', 'p-4');
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('p-4')).toBe(true);

      fixture.componentRef.setInput('padding', 'p-0');
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('p-0')).toBe(true);
    });
  });

  describe('Template Structure', () => {
    it('should apply base container classes to inner div', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const innerDiv = compiled.querySelectorAll('div')[1];
      expect(innerDiv?.classList.contains('mx-auto')).toBe(true);
      expect(innerDiv?.classList.contains('px-4')).toBe(true);
      expect(innerDiv?.classList.contains('sm:px-6')).toBe(true);
      expect(innerDiv?.classList.contains('lg:px-8')).toBe(true);
    });

    it('should have correct number of divs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const allDivs = compiled.querySelectorAll('div');
      expect(allDivs.length).toBe(2);
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <app-page-container>
          <div class="custom-content">Test Content</div>
        </app-page-container>
      `,
      imports: [PageContainerComponent],
    })
    class TestHostComponent {}

    it('should project custom content', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const customContent = compiled.querySelector('.custom-content');
      expect(customContent?.textContent?.trim()).toBe('Test Content');
    });
  });
});
