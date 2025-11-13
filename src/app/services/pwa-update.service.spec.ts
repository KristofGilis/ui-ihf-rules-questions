import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { PwaUpdateService } from './pwa-update.service';
import { ToastService } from './toast.service';

describe('PwaUpdateService', () => {
  let service: PwaUpdateService;
  let swUpdateMock: Partial<SwUpdate>;
  let toastServiceMock: Partial<ToastService>;
  let translateServiceMock: Partial<TranslateService>;

  beforeEach(() => {
    swUpdateMock = {
      isEnabled: true,
      versionUpdates: { subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) } as any,
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

  describe('Service Integration', () => {
    it('should have all required services injected', () => {
      expect(service['_toastService']).toBeDefined();
      expect(service['_translateService']).toBeDefined();
      expect(service['_swUpdate']).toBeDefined();
    });
  });
});
