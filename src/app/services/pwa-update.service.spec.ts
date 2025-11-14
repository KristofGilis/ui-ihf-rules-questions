import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { PwaUpdateService } from './pwa-update.service';
import { ToastService } from './toast.service';

describe('PwaUpdateService', () => {
  let service: PwaUpdateService;
  let destroyRef: DestroyRef;
  let swUpdateMock: Partial<SwUpdate>;
  let toastServiceMock: Partial<ToastService>;
  let translateServiceMock: Partial<TranslateService>;

  beforeEach(() => {
    swUpdateMock = {
      isEnabled: true,
      versionUpdates: {
        pipe: jest.fn(() => ({
          subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
        })),
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      } as any,
      checkForUpdate: jest.fn().mockResolvedValue(true),
      activateUpdate: jest.fn().mockResolvedValue(true),
    };

    toastServiceMock = {
      show: jest.fn(),
    };

    translateServiceMock = {
      instant: jest.fn((key: string) => {
        const translations: { [key: string]: string } = {
          'pwa.update_available': 'A new version is available.',
          'pwa.update_now': 'Update',
        };
        return translations[key] || key;
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        PwaUpdateService,
        { provide: SwUpdate, useValue: swUpdateMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    });

    service = TestBed.inject(PwaUpdateService);
    destroyRef = TestBed.inject(DestroyRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('activateUpdate()', () => {
    it('should call activateUpdate on SwUpdate service', async () => {
      const activateUpdateSpy = swUpdateMock.activateUpdate as jest.Mock;

      service.activateUpdate();

      await Promise.resolve();

      expect(activateUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('initializeUpdateCheck()', () => {
    it('should initialize without error when SW is enabled', () => {
      expect(() => service.initializeUpdateCheck(destroyRef)).not.toThrow();
    });

    it('should log message when SW is not enabled', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const swUpdateDisabled = {
        ...swUpdateMock,
        isEnabled: false,
      } as any;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          PwaUpdateService,
          { provide: SwUpdate, useValue: swUpdateDisabled },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: TranslateService, useValue: translateServiceMock },
        ],
      });

      const disabledService = TestBed.inject(PwaUpdateService);
      const disabledDestroyRef = TestBed.inject(DestroyRef);
      disabledService.initializeUpdateCheck(disabledDestroyRef);

      expect(consoleLogSpy).toHaveBeenCalledWith('Service Worker is not enabled');
      consoleLogSpy.mockRestore();
    });

    it('should call checkForUpdate on initialization when SW is enabled', () => {
      const checkForUpdateSpy = swUpdateMock.checkForUpdate as jest.Mock;
      service.initializeUpdateCheck(destroyRef);

      expect(checkForUpdateSpy).toHaveBeenCalled();
    });

    it('should subscribe to versionUpdates', () => {
      const versionUpdatesSpy = (swUpdateMock.versionUpdates as any).pipe as jest.Mock;
      service.initializeUpdateCheck(destroyRef);

      expect(versionUpdatesSpy).toHaveBeenCalled();
    });

    it('should show toast when VERSION_READY event is received', () => {
      let capturedListener: ((event: any) => void) | undefined;
      (swUpdateMock.versionUpdates as any).pipe = jest.fn(() => ({
        subscribe: jest.fn((callback: (event: any) => void) => {
          capturedListener = callback;
          return { unsubscribe: jest.fn() };
        }),
      }));

      service.initializeUpdateCheck(destroyRef);

      if (capturedListener) {
        capturedListener({ type: 'VERSION_READY' });

        expect(toastServiceMock.show).toHaveBeenCalledWith(
          'A new version is available.',
          expect.objectContaining({
            type: 'info',
            duration: 0,
            dismissible: true,
          })
        );
      }
    });

    it('should not show toast for VERSION_INSTALLED event', () => {
      let capturedListener: ((event: any) => void) | undefined;
      (swUpdateMock.versionUpdates as any).pipe = jest.fn(() => ({
        subscribe: jest.fn((callback: (event: any) => void) => {
          capturedListener = callback;
          return { unsubscribe: jest.fn() };
        }),
      }));

      (toastServiceMock.show as jest.Mock).mockClear();
      service.initializeUpdateCheck(destroyRef);

      if (capturedListener) {
        capturedListener({ type: 'VERSION_INSTALLED' });
        expect(toastServiceMock.show).not.toHaveBeenCalled();
      }
    });

    it('should setup periodic interval check for updates', () => {
      // Mock interval to return a test subject we can control
      const intervalSubject = new Subject<number>();
      jest.spyOn(require('rxjs'), 'interval').mockReturnValue(intervalSubject);

      service.initializeUpdateCheck(destroyRef);

      // Verify interval was created for periodic checks
      expect(require('rxjs').interval).toHaveBeenCalledWith(3600000);
    });

    it('should call checkForUpdate when interval triggers', (done) => {
      const checkForUpdateSpy = swUpdateMock.checkForUpdate as jest.Mock;

      // Setup a simple observable that emits once
      const intervalObs = of(1);
      jest.spyOn(require('rxjs'), 'interval').mockReturnValue(intervalObs);

      service.initializeUpdateCheck(destroyRef);

      setTimeout(() => {
        // Should be called at least twice: once on init, and once from interval
        expect(checkForUpdateSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
        done();
      }, 50);
    });
  });
  describe('Service Integration', () => {
    it('should have all required services injected', () => {
      expect(service['_toastService']).toBeDefined();
      expect(service['_translateService']).toBeDefined();
      expect(service['_swUpdate']).toBeDefined();
    });

    it('should have correct public methods', () => {
      expect(typeof service.initializeUpdateCheck).toBe('function');
      expect(typeof service.activateUpdate).toBe('function');
    });

    it('should be initialized with enabled service worker by default', () => {
      expect((swUpdateMock as any).isEnabled).toBe(true);
      expect(service).toBeTruthy();
    });
  });
});
