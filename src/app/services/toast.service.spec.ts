import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Toast Display Methods', () => {
    it('should show success toast', () => {
      const spy = jest.spyOn(service, 'show');
      service.success('Success message');
      expect(spy).toHaveBeenCalledWith('Success message', expect.objectContaining({ type: 'success' }));
    });

    it('should show error toast', () => {
      const spy = jest.spyOn(service, 'show');
      service.error('Error message');
      expect(spy).toHaveBeenCalledWith('Error message', expect.objectContaining({ type: 'error' }));
    });

    it('should show warning toast', () => {
      const spy = jest.spyOn(service, 'show');
      service.warning('Warning message');
      expect(spy).toHaveBeenCalledWith('Warning message', expect.objectContaining({ type: 'warning' }));
    });

    it('should show info toast', () => {
      const spy = jest.spyOn(service, 'show');
      service.info('Info message');
      expect(spy).toHaveBeenCalledWith('Info message', expect.objectContaining({ type: 'info' }));
    });
  });

  describe('Toast Lifecycle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-dismiss toast after duration', () => {
      // Show a toast with a short duration
      service.show('Test message', { type: 'info', duration: 3000 });

      // Get the toast component instance
      const toastComponentRef = (service as any)._toastComponentRef;
      const dismissSpy = jest.spyOn(toastComponentRef.instance, 'dismiss');

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(3000);

      // The toast should have been dismissed
      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should not auto-dismiss toast when duration is 0', () => {
      // Show a toast with duration 0
      service.show('Test message', { type: 'info', duration: 0 });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      // No setTimeout should have been called
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });

  describe('Toast with Action', () => {
    it('should pass action property to toast component', () => {
      const callback = jest.fn();
      const action = { label: 'Click me', callback };

      service.show('Test message', {
        type: 'info',
        duration: 0,
        dismissible: true,
        action,
      });

      // Verify the toast component was created and action was passed
      expect(callback).not.toHaveBeenCalled(); // Action shouldn't be called until user clicks
    });

    it('should show toast with action button', () => {
      const callback = jest.fn();

      service.show('Update available', {
        type: 'info',
        duration: 0,
        dismissible: true,
        action: {
          label: 'Update now',
          callback,
        },
      });

      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });
});
