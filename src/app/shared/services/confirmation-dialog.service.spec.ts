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

  it('should close existing dialog when opening a new one', () => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    service.confirm(data);
    const firstDialogRef = (service as any)._dialogRef;
    expect(firstDialogRef).toBeTruthy();

    service.confirm(data);
    const secondDialogRef = (service as any)._dialogRef;

    expect(secondDialogRef).toBeTruthy();
    expect(secondDialogRef).not.toBe(firstDialogRef); // Should be a different instance

    const dialogs = document.querySelectorAll('app-confirmation-dialog');
    expect(dialogs.length).toBe(1); // Should only have one dialog in DOM
  });

  it('should emit true and close dialog when confirmed', (done) => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    service.confirm(data).subscribe({
      next: (result) => {
        expect(result).toBe(true);
        done();
      },
    });

    // Access the component through the service's private property
    const componentRef = (service as any)._dialogRef;
    expect(componentRef).toBeTruthy();

    // Call onConfirm directly
    componentRef.instance.onConfirm();
  });

  it('should emit false and close dialog when cancelled', (done) => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    service.confirm(data).subscribe({
      next: (result) => {
        expect(result).toBe(false);
        done();
      },
    });

    // Access the component through the service's private property
    const componentRef = (service as any)._dialogRef;
    expect(componentRef).toBeTruthy();

    // Call onCancel directly
    componentRef.instance.onCancel();
  });

  it('should set correct data on dialog component', () => {
    const data = {
      title: 'Custom Title',
      message: 'Custom Message',
      confirmText: 'Yes',
      cancelText: 'No',
    };

    service.confirm(data);

    const componentRef = (service as any)._dialogRef;
    expect(componentRef).toBeTruthy();
    expect(componentRef.instance.data).toEqual(data);
  });

  it('should append dialog to document body', () => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    service.confirm(data);

    const dialog = document.body.querySelector('app-confirmation-dialog');
    expect(dialog).toBeTruthy();
  });

  it('should complete the observable after confirm', (done) => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    let completed = false;

    service.confirm(data).subscribe({
      next: () => {},
      complete: () => {
        completed = true;
        expect(completed).toBe(true);
        done();
      },
    });

    const componentRef = (service as any)._dialogRef;
    componentRef.instance.onConfirm();
  });

  it('should complete the observable after cancel', (done) => {
    const data = {
      title: 'Test',
      message: 'Test',
      confirmText: 'OK',
      cancelText: 'Cancel',
    };

    let completed = false;

    service.confirm(data).subscribe({
      next: () => {},
      complete: () => {
        completed = true;
        expect(completed).toBe(true);
        done();
      },
    });

    const componentRef = (service as any)._dialogRef;
    componentRef.instance.onCancel();
  });

  it('should handle close gracefully when no dialog is open', () => {
    // Ensure _dialogRef is null
    (service as any)._dialogRef = null;

    // Call the private close method through a confirm/cancel flow
    // This tests the if (this._dialogRef) branch when _dialogRef is null
    expect(() => {
      (service as any).close();
    }).not.toThrow();
  });
});
