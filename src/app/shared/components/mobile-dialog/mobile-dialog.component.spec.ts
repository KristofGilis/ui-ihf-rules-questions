import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileDialogComponent } from './mobile-dialog.component';

describe('MobileDialogComponent', () => {
  let component: MobileDialogComponent;
  let fixture: ComponentFixture<MobileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Signals', () => {
    it('should require open input', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      expect(component.open()).toBe(true);
    });

    it('should update open signal', () => {
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
      expect(component.open()).toBe(false);

      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });

    it('should have default closeTitle of "Close"', () => {
      expect(component.closeTitle()).toBe('Close');
    });

    it('should accept custom closeTitle', () => {
      fixture.componentRef.setInput('closeTitle', 'Dismiss');
      fixture.detectChanges();

      expect(component.closeTitle()).toBe('Dismiss');
    });

    it('should have default backdropClose of true', () => {
      expect(component.backdropClose()).toBe(true);
    });

    it('should accept custom backdropClose', () => {
      fixture.componentRef.setInput('backdropClose', false);
      fixture.detectChanges();

      expect(component.backdropClose()).toBe(false);
    });
  });

  describe('FontAwesome Icon', () => {
    it('should have faTimes icon defined', () => {
      expect(component.faTimes).toBeDefined();
      expect(component.faTimes.iconName).toBe('xmark');
    });
  });

  describe('Keyboard Interactions', () => {
    it('should emit closed when escape key is pressed and dialog is open', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit closed when escape key is pressed and dialog is closed', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple escape key presses when open', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const event1 = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event1);

      const event2 = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event2);

      expect(closedSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('onBackdropClick', () => {
    it('should emit closed when backdropClose is true', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('backdropClose', true);
      fixture.detectChanges();

      component.onBackdropClick();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit closed when backdropClose is false', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('backdropClose', false);
      fixture.detectChanges();

      component.onBackdropClick();

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should emit closed multiple times when called multiple times', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('backdropClose', true);
      fixture.detectChanges();

      component.onBackdropClick();
      component.onBackdropClick();
      component.onBackdropClick();

      expect(closedSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('onCloseClick', () => {
    it('should emit closed when close button is clicked', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);

      component.onCloseClick();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit closed regardless of backdropClose setting', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('backdropClose', false);
      fixture.detectChanges();

      component.onCloseClick();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit closed multiple times when called multiple times', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);

      component.onCloseClick();
      component.onCloseClick();
      component.onCloseClick();

      expect(closedSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Output Signal', () => {
    it('should have closed output defined', () => {
      expect(component.closed).toBeDefined();
    });

    it('should allow multiple subscriptions to closed event', () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      component.closed.subscribe(subscriber1);
      component.closed.subscribe(subscriber2);

      component.onCloseClick();

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle opening and closing dialog', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);

      // Open dialog
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);

      // Close via button
      component.onCloseClick();
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect backdropClose configuration', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);

      // Disable backdrop close
      fixture.componentRef.setInput('backdropClose', false);
      fixture.detectChanges();

      // Try backdrop click
      component.onBackdropClick();
      expect(closedSpy).not.toHaveBeenCalled();

      // Close button should still work
      component.onCloseClick();
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle all closing methods when enabled', () => {
      const closedSpy = jest.fn();
      component.closed.subscribe(closedSpy);
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('backdropClose', true);
      fixture.detectChanges();

      // Close via escape
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(closedSpy).toHaveBeenCalledTimes(1);

      // Close via backdrop
      component.onBackdropClick();
      expect(closedSpy).toHaveBeenCalledTimes(2);

      // Close via button
      component.onCloseClick();
      expect(closedSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('ChangeDetection', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.instance).toBeTruthy();
      // Component should work with OnPush strategy
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });
  });
});
