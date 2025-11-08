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
});
