import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('SVG Template', () => {
    it('should render svg element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svgElement = compiled.querySelector('svg');
      expect(svgElement).toBeTruthy();
    });

    it('should have correct viewBox attribute', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svgElement = compiled.querySelector('svg');
      expect(svgElement?.getAttribute('viewBox')).toBe('0 0 312.05792 525');
    });

    it('should have correct width and height classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svgElement = compiled.querySelector('svg');
      expect(svgElement?.classList.contains('w-full')).toBe(true);
      expect(svgElement?.classList.contains('h-full')).toBe(true);
    });

    it('should have defs element with gradients', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const defsElement = compiled.querySelector('defs');
      expect(defsElement).toBeTruthy();
    });

    it('should contain linearGradient definition', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const linearGradient = compiled.querySelector('linearGradient');
      expect(linearGradient).toBeTruthy();
      expect(linearGradient?.id).toBe('linearGradient570');
    });

    it('should contain radialGradient definition', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const radialGradient = compiled.querySelector('radialGradient');
      expect(radialGradient).toBeTruthy();
      expect(radialGradient?.id).toBe('radialGradient6820');
    });

    it('should have main group element with correct transform', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const groupElement = compiled.querySelector('g');
      expect(groupElement).toBeTruthy();
      expect(groupElement?.getAttribute('transform')).toBe('matrix(6.537919,0,0,6.537919,-60.171051,-97.087816)');
    });

    it('should contain multiple path elements', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pathElements = compiled.querySelectorAll('path');
      expect(pathElements.length).toBeGreaterThan(0);
    });
  });
});
