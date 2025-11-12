import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent, FaIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Size Input', () => {
    it('should default to md size', () => {
      expect(component.size()).toBe('md');
      expect(component.iconSize()).toBe('xl');
    });

    it('should map sm size to lg icon', () => {
      fixture.componentRef.setInput('size', 'sm');
      expect(component.iconSize()).toBe('lg');
    });

    it('should map md size to xl icon', () => {
      fixture.componentRef.setInput('size', 'md');
      expect(component.iconSize()).toBe('xl');
    });

    it('should map lg size to 2x icon', () => {
      fixture.componentRef.setInput('size', 'lg');
      expect(component.iconSize()).toBe('2x');
    });

    it('should map xl size to 3x icon', () => {
      fixture.componentRef.setInput('size', 'xl');
      expect(component.iconSize()).toBe('3x');
    });
  });

  describe('Text Input', () => {
    it('should not display text by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('p');
      expect(textElement).toBeNull();
    });

    it('should display text when provided', () => {
      fixture.componentRef.setInput('text', 'Loading...');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('p');
      expect(textElement?.textContent?.trim()).toBe('Loading...');
    });

    it('should update text when input changes', () => {
      fixture.componentRef.setInput('text', 'Loading data...');
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let textElement = compiled.querySelector('p');
      expect(textElement?.textContent?.trim()).toBe('Loading data...');

      fixture.componentRef.setInput('text', 'Please wait...');
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      textElement = compiled.querySelector('p');
      expect(textElement?.textContent?.trim()).toBe('Please wait...');
    });
  });

  describe('Template', () => {
    it('should render fa-icon with spinner', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('fa-icon');
      expect(icon).toBeTruthy();
    });

    it('should apply correct CSS classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.flex.justify-center.items-center.py-16');
      expect(container).toBeTruthy();
    });

    it('should apply text color classes to icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('fa-icon');
      expect(icon?.classList.contains('text-cyan-500')).toBe(true);
    });
  });

  describe('Computed Icon Size', () => {
    it('should recompute iconSize when size input changes', () => {
      expect(component.iconSize()).toBe('xl'); // default md -> xl

      fixture.componentRef.setInput('size', 'sm');
      expect(component.iconSize()).toBe('lg');

      fixture.componentRef.setInput('size', 'lg');
      expect(component.iconSize()).toBe('2x');

      fixture.componentRef.setInput('size', 'xl');
      expect(component.iconSize()).toBe('3x');
    });
  });
});
