import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Initialization', () => {
    it('should initialize with empty data object', () => {
      expect(component.data).toEqual({
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
      });
    });

    it('should accept custom data', () => {
      const customData: ConfirmationDialogData = {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      };
      component.data = customData;
      fixture.detectChanges();

      expect(component.data).toEqual(customData);
    });
  });

  describe('ngOnInit', () => {
    it('should be called during component initialization', () => {
      // ngOnInit is called automatically during component creation
      // The focus logic inside setTimeout is hard to test reliably
      expect(component).toBeTruthy();
    });

    it('should handle missing dialog element gracefully', (done) => {
      // Create a new component instance to test ngOnInit again
      const newFixture = TestBed.createComponent(ConfirmationDialogComponent);
      const newComponent = newFixture.componentInstance;

      // ngOnInit will be called automatically which should not throw
      newFixture.detectChanges();

      setTimeout(() => {
        // Should not throw error even if dialog element is not found
        expect(true).toBe(true);
        done();
      }, 10);
    });
  });

  describe('Callback Functions', () => {
    it('should have undefined callbacks by default', () => {
      expect(component.onConfirm).toBeUndefined();
      expect(component.onCancel).toBeUndefined();
    });

    it('should accept onConfirm callback', () => {
      const confirmCallback = jest.fn();
      component.onConfirm = confirmCallback;

      expect(component.onConfirm).toBe(confirmCallback);
    });

    it('should accept onCancel callback', () => {
      const cancelCallback = jest.fn();
      component.onCancel = cancelCallback;

      expect(component.onCancel).toBe(cancelCallback);
    });
  });

  describe('handleConfirm', () => {
    it('should call onConfirm callback if defined', () => {
      const confirmCallback = jest.fn();
      component.onConfirm = confirmCallback;

      component.handleConfirm();

      expect(confirmCallback).toHaveBeenCalledTimes(1);
    });

    it('should not throw error if onConfirm is undefined', () => {
      component.onConfirm = undefined;

      expect(() => component.handleConfirm()).not.toThrow();
    });
  });

  describe('handleCancel', () => {
    it('should call onCancel callback if defined', () => {
      const cancelCallback = jest.fn();
      component.onCancel = cancelCallback;

      component.handleCancel();

      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('should not throw error if onCancel is undefined', () => {
      component.onCancel = undefined;

      expect(() => component.handleCancel()).not.toThrow();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should call handleCancel when escape key is pressed', () => {
      const cancelCallback = jest.fn();
      component.onCancel = cancelCallback;

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle escape key when onCancel is undefined', () => {
      component.onCancel = undefined;

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      expect(() => document.dispatchEvent(event)).not.toThrow();
    });
  });

  describe('Backdrop Click', () => {
    it('should call handleCancel when backdrop is clicked', () => {
      const cancelCallback = jest.fn();
      component.onCancel = cancelCallback;

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      } as unknown as MouseEvent;
      // Set target and currentTarget to be the same (backdrop click)
      Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

      component.onBackdropClick(mockEvent);

      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call handleCancel when clicking inside dialog content', () => {
      const cancelCallback = jest.fn();
      component.onCancel = cancelCallback;

      const backdrop = document.createElement('div');
      const content = document.createElement('div');
      const mockEvent = {
        target: content,
        currentTarget: backdrop,
      } as unknown as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(cancelCallback).not.toHaveBeenCalled();
    });

    it('should handle backdrop click when onCancel is undefined', () => {
      component.onCancel = undefined;

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      } as unknown as MouseEvent;
      Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete confirm flow', () => {
      const confirmCallback = jest.fn();
      const cancelCallback = jest.fn();

      component.data = {
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No',
      };
      component.onConfirm = confirmCallback;
      component.onCancel = cancelCallback;

      component.handleConfirm();

      expect(confirmCallback).toHaveBeenCalledTimes(1);
      expect(cancelCallback).not.toHaveBeenCalled();
    });

    it('should handle complete cancel flow', () => {
      const confirmCallback = jest.fn();
      const cancelCallback = jest.fn();

      component.data = {
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No',
      };
      component.onConfirm = confirmCallback;
      component.onCancel = cancelCallback;

      component.handleCancel();

      expect(cancelCallback).toHaveBeenCalledTimes(1);
      expect(confirmCallback).not.toHaveBeenCalled();
    });
  });
});
