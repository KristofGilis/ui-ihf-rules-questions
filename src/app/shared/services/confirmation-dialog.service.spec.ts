import { TestBed } from '@angular/core/testing';
import { ConfirmationDialogService } from './confirmation-dialog.service';

describe('ConfirmationDialogService', () => {
  let service: ConfirmationDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationDialogService],
    });
    service = TestBed.inject(ConfirmationDialogService);
  });

  afterEach(() => {
    // Clean up any remaining dialog elements
    document.body.style.overflow = '';
    const dialogs = document.querySelectorAll('app-confirmation-dialog');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an observable when confirm is called', () => {
    const data = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    };

    const observable = service.confirm(data);
    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();
  });

  it('should prevent body scroll when dialog is open', () => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    service.confirm(data);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
