import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleExclamation, faCircleInfo, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent, FaIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add a new toast', () => {
      const toast = {
        message: 'Test message',
        type: 'success' as const,
        dismissible: true,
      };

      const id = component.add(toast);

      expect(component.toasts()).toHaveLength(1);
      expect(component.toasts()[0]).toEqual({ ...toast, id });
    });

    it('should return unique ID for each toast', () => {
      const toast = {
        message: 'Test',
        type: 'info' as const,
        dismissible: true,
      };

      const id1 = component.add(toast);
      jest.advanceTimersByTime(1); // Advance time by 1ms
      const id2 = component.add(toast);

      expect(id1).not.toBe(id2);
      expect(component.toasts()).toHaveLength(2);
    });

    it('should add multiple toasts', () => {
      component.add({ message: 'First', type: 'success', dismissible: true });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Second', type: 'error', dismissible: false });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Third', type: 'warning', dismissible: true });

      expect(component.toasts()).toHaveLength(3);
      expect(component.toasts()[0].message).toBe('First');
      expect(component.toasts()[1].message).toBe('Second');
      expect(component.toasts()[2].message).toBe('Third');
    });

    it('should preserve toast order', () => {
      const id1 = component.add({ message: 'First', type: 'info', dismissible: true });
      jest.advanceTimersByTime(1);
      const id2 = component.add({ message: 'Second', type: 'success', dismissible: true });
      jest.advanceTimersByTime(1);
      const id3 = component.add({ message: 'Third', type: 'error', dismissible: true });

      expect(component.toasts()[0].id).toBe(id1);
      expect(component.toasts()[1].id).toBe(id2);
      expect(component.toasts()[2].id).toBe(id3);
    });
  });

  describe('dismiss()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should remove toast by ID', () => {
      const id = component.add({ message: 'Test', type: 'info', dismissible: true });

      expect(component.toasts()).toHaveLength(1);

      component.dismiss(id);

      expect(component.toasts()).toHaveLength(0);
    });

    it('should only remove the specified toast', () => {
      const id1 = component.add({ message: 'First', type: 'success', dismissible: true });
      jest.advanceTimersByTime(1);
      const id2 = component.add({ message: 'Second', type: 'error', dismissible: true });
      jest.advanceTimersByTime(1);
      const id3 = component.add({ message: 'Third', type: 'warning', dismissible: true });

      component.dismiss(id2);

      expect(component.toasts()).toHaveLength(2);
      expect(component.toasts()[0].id).toBe(id1);
      expect(component.toasts()[1].id).toBe(id3);
    });

    it('should handle dismissing non-existent toast gracefully', () => {
      component.add({ message: 'Test', type: 'info', dismissible: true });

      expect(() => component.dismiss(99999)).not.toThrow();
      expect(component.toasts()).toHaveLength(1);
    });

    it('should handle dismissing from empty toasts', () => {
      expect(() => component.dismiss(1)).not.toThrow();
      expect(component.toasts()).toHaveLength(0);
    });
  });

  describe('getIcon()', () => {
    it('should return correct icon for error type', () => {
      const icon = component.getIcon('error');
      expect(icon).toBe(faCircleXmark);
    });

    it('should return correct icon for warning type', () => {
      const icon = component.getIcon('warning');
      expect(icon).toBe(faCircleExclamation);
    });

    it('should return correct icon for success type', () => {
      const icon = component.getIcon('success');
      expect(icon).toBe(faCircleCheck);
    });

    it('should return correct icon for info type', () => {
      const icon = component.getIcon('info');
      expect(icon).toBe(faCircleInfo);
    });
  });

  describe('getToastClasses()', () => {
    it('should return correct classes for error type', () => {
      const classes = component.getToastClasses('error');
      expect(classes).toBe('bg-gradient-to-br from-red-500 to-rose-600 text-white');
    });

    it('should return correct classes for warning type', () => {
      const classes = component.getToastClasses('warning');
      expect(classes).toBe('bg-gradient-to-br from-amber-500 to-orange-600 text-white');
    });

    it('should return correct classes for success type', () => {
      const classes = component.getToastClasses('success');
      expect(classes).toBe('bg-gradient-to-br from-emerald-500 to-teal-600 text-white');
    });

    it('should return correct classes for info type', () => {
      const classes = component.getToastClasses('info');
      expect(classes).toBe('bg-gradient-to-br from-cyan-500 to-blue-600 text-white');
    });
  });

  describe('Toast Signal', () => {
    it('should initialize with empty array', () => {
      expect(component.toasts()).toEqual([]);
    });

    it('should update signal when adding toasts', () => {
      const initialLength = component.toasts().length;

      component.add({ message: 'Test', type: 'info', dismissible: true });

      expect(component.toasts().length).toBe(initialLength + 1);
    });

    it('should update signal when dismissing toasts', () => {
      const id = component.add({ message: 'Test', type: 'info', dismissible: true });
      expect(component.toasts()).toHaveLength(1);

      component.dismiss(id);
      expect(component.toasts()).toHaveLength(0);
    });
  });

  describe('Toast Properties', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should preserve dismissible property', () => {
      component.add({ message: 'Dismissible', type: 'info', dismissible: true });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Not dismissible', type: 'error', dismissible: false });

      expect(component.toasts()[0].dismissible).toBe(true);
      expect(component.toasts()[1].dismissible).toBe(false);
    });

    it('should preserve message property', () => {
      const message = 'Important notification message';
      component.add({ message, type: 'warning', dismissible: true });

      expect(component.toasts()[0].message).toBe(message);
    });

    it('should preserve type property', () => {
      component.add({ message: 'Test', type: 'success', dismissible: true });

      expect(component.toasts()[0].type).toBe('success');
    });
  });

  describe('executeAction()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should execute callback and dismiss toast', () => {
      const callback = jest.fn();
      const id = component.add({
        message: 'Test',
        type: 'info',
        dismissible: true,
        action: { label: 'Action', callback },
      });

      expect(component.toasts()).toHaveLength(1);
      component.executeAction(id, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(component.toasts()).toHaveLength(0);
    });

    it('should only dismiss the specified toast', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const id1 = component.add({
        message: 'First',
        type: 'info',
        dismissible: true,
        action: { label: 'Action', callback: callback1 },
      });
      jest.advanceTimersByTime(1);
      const id2 = component.add({
        message: 'Second',
        type: 'success',
        dismissible: true,
        action: { label: 'Action', callback: callback2 },
      });

      component.executeAction(id1, callback1);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
      expect(component.toasts()).toHaveLength(1);
      expect(component.toasts()[0].id).toBe(id2);
    });

    it('should handle callback that throws error gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      const id = component.add({
        message: 'Test',
        type: 'info',
        dismissible: true,
        action: { label: 'Action', callback: errorCallback },
      });

      expect(() => component.executeAction(id, errorCallback)).toThrow();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should work with empty callback', () => {
      const callback = jest.fn();
      const id = component.add({
        message: 'Test',
        type: 'info',
        dismissible: true,
        action: { label: 'Action', callback },
      });

      component.executeAction(id, () => {
        // Empty callback
      });

      expect(component.toasts()).toHaveLength(0);
    });

    it('should handle multiple executeAction calls', () => {
      jest.useFakeTimers();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const id1 = component.add({
        message: 'First',
        type: 'info',
        dismissible: true,
        action: { label: 'Action', callback: callback1 },
      });
      jest.advanceTimersByTime(1);
      const id2 = component.add({
        message: 'Second',
        type: 'success',
        dismissible: true,
        action: { label: 'Action', callback: callback2 },
      });

      component.executeAction(id1, callback1);
      component.executeAction(id2, callback2);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(component.toasts()).toHaveLength(0);
    });
  });

  describe('Toast with Action', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add toast with action', () => {
      const callback = jest.fn();
      const action = { label: 'Update', callback };

      component.add({
        message: 'New version available',
        type: 'info',
        dismissible: true,
        action,
      });

      expect(component.toasts()[0].action).toEqual(action);
    });

    it('should add toast without action', () => {
      component.add({
        message: 'Simple toast',
        type: 'info',
        dismissible: true,
      });

      expect(component.toasts()[0].action).toBeUndefined();
    });

    it('should support optional action property', () => {
      component.add({
        message: 'With action',
        type: 'info',
        dismissible: true,
        action: { label: 'Click me', callback: jest.fn() },
      });
      jest.advanceTimersByTime(1);
      component.add({
        message: 'Without action',
        type: 'success',
        dismissible: true,
      });

      expect(component.toasts()).toHaveLength(2);
      expect(component.toasts()[0].action).toBeDefined();
      expect(component.toasts()[1].action).toBeUndefined();
    });
  });

  describe('Integration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle rapid add and dismiss operations', () => {
      const id1 = component.add({ message: '1', type: 'info', dismissible: true });
      jest.advanceTimersByTime(1);
      const id2 = component.add({ message: '2', type: 'success', dismissible: true });
      component.dismiss(id1);
      jest.advanceTimersByTime(1);
      const id3 = component.add({ message: '3', type: 'error', dismissible: true });
      component.dismiss(id2);

      expect(component.toasts()).toHaveLength(1);
      expect(component.toasts()[0].id).toBe(id3);
      expect(component.toasts()[0].message).toBe('3');
    });

    it('should handle adding all toast types', () => {
      component.add({ message: 'Error', type: 'error', dismissible: true });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Warning', type: 'warning', dismissible: true });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Success', type: 'success', dismissible: true });
      jest.advanceTimersByTime(1);
      component.add({ message: 'Info', type: 'info', dismissible: true });

      expect(component.toasts()).toHaveLength(4);
      expect(component.toasts().map((t) => t.type)).toEqual(['error', 'warning', 'success', 'info']);
    });
  });
});
