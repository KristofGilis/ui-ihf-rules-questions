import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { GradientButtonComponent } from './gradient-button.component';

describe('GradientButtonComponent', () => {
  let component: GradientButtonComponent;
  let fixture: ComponentFixture<GradientButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GradientButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default variant as primary', () => {
      expect(component.variant()).toBe('primary');
    });

    it('should accept variant input', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();

      expect(component.variant()).toBe('success');
    });

    it('should have default loading as false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should accept loading input', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(component.loading()).toBe(true);
    });

    it('should have default disabled as false', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should accept disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
    });

    it('should have default fullWidth as false', () => {
      expect(component.fullWidth()).toBe(false);
    });

    it('should accept fullWidth input', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      expect(component.fullWidth()).toBe(true);
    });

    it('should have default size as md', () => {
      expect(component.size()).toBe('md');
    });

    it('should accept size input', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      expect(component.size()).toBe('lg');
    });

    it('should have default type as button', () => {
      expect(component.type()).toBe('button');
    });

    it('should accept type input', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      expect(component.type()).toBe('submit');
    });

    it('should accept icon input', () => {
      fixture.componentRef.setInput('icon', faCheck);
      fixture.detectChanges();

      expect(component.icon()).toEqual(faCheck);
    });

    it('should accept loadingIcon input', () => {
      fixture.componentRef.setInput('loadingIcon', faSpinner);
      fixture.componentRef.setInput('loading', true); // Loading must be true to show loading icon
      fixture.detectChanges();

      expect(component.loadingIcon()).toEqual(faSpinner);
    });

    it('should accept title input', () => {
      fixture.componentRef.setInput('title', 'Click me');
      fixture.detectChanges();

      expect(component.title()).toBe('Click me');
    });
  });

  describe('Click Behavior', () => {
    it('should emit clicked event when button is clicked', () => {
      const clickedSpy = jest.fn();
      component.clicked.subscribe(clickedSpy);

      component.onClick();

      expect(clickedSpy).toHaveBeenCalled();
    });

    it('should not emit clicked event when disabled', () => {
      const clickedSpy = jest.fn();
      component.clicked.subscribe(clickedSpy);
      fixture.componentRef.setInput('disabled', true);

      component.onClick();

      expect(clickedSpy).not.toHaveBeenCalled();
    });

    it('should not emit clicked event when loading', () => {
      const clickedSpy = jest.fn();
      component.clicked.subscribe(clickedSpy);
      fixture.componentRef.setInput('loading', true);

      component.onClick();

      expect(clickedSpy).not.toHaveBeenCalled();
    });

    it('should not emit clicked event when both disabled and loading', () => {
      const clickedSpy = jest.fn();
      component.clicked.subscribe(clickedSpy);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('loading', true);

      component.onClick();

      expect(clickedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render button element', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should apply correct type attribute', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('submit');
    });

    it('should disable button when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });

    it('should disable button when loading is true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });

    it('should apply title attribute when provided', () => {
      fixture.componentRef.setInput('title', 'Tooltip text');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.title).toBe('Tooltip text');
    });

    it('should show loading icon when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.componentRef.setInput('loadingIcon', faSpinner);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('fa-icon');
      expect(icon).toBeTruthy();
    });

    it('should show regular icon when not loading', () => {
      fixture.componentRef.setInput('icon', faCheck);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('fa-icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('CSS Classes', () => {
    it('should apply from-cyan-500 to-blue-600 gradient for primary variant', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('from-cyan-500');
      expect(button.className).toContain('to-blue-600');
    });

    it('should apply from-emerald-500 to-teal-600 gradient for success variant', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('from-emerald-500');
      expect(button.className).toContain('to-teal-600');
    });

    it('should apply w-full class when fullWidth is true', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('w-full');
    });

    it('should apply flex-1 class when fullWidth is false', () => {
      fixture.componentRef.setInput('fullWidth', false);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('flex-1');
    });

    it('should apply size-specific padding classes', () => {
      // Small size
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      let button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('py-2');

      // Large size
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('px-8');
      expect(button.className).toContain('py-4');

      // Medium size
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();
      button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('py-3');
    });

    it('should apply disabled styling when disabled or loading', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('cursor-not-allowed');
      expect(button.className).toContain('opacity-50');

      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('cursor-not-allowed');
      expect(button.className).toContain('opacity-50');
    });

    it('should apply hover effects when not disabled or loading', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('hover:scale-105');
      expect(button.className).toContain('active:scale-95');
      expect(button.className).toContain('hover:shadow-xl');
    });
  });
});
