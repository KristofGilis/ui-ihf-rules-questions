import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { GlobalErrorHandler } from './global-error-handler.service';
import { ToastService } from './toast.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let toastService: jest.Mocked<ToastService>;
  let translateService: jest.Mocked<TranslateService>;

  beforeEach(() => {
    const toastServiceMock = {
      show: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: ToastService, useValue: toastServiceMock }, provideTranslateService()],
    });

    handler = TestBed.inject(GlobalErrorHandler);
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    translateService = TestBed.inject(TranslateService) as jest.Mocked<TranslateService>;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should handle generic errors', () => {
    const error = new Error('Test error');
    handler.handleError(error);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle HTTP errors', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      url: '/api/test',
    });
    handler.handleError(httpError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle network errors', () => {
    const networkError = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
    });
    handler.handleError(networkError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle 404 errors', () => {
    const notFoundError = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      url: '/api/missing',
    });
    handler.handleError(notFoundError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should unwrap promise rejection errors', () => {
    const wrappedError = {
      rejection: new Error('Wrapped error'),
    };
    handler.handleError(wrappedError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should call translateService for error messages', () => {
    const error = new Error('Test');
    handler.handleError(error);
    expect(translateService.instant).toHaveBeenCalled();
  });
});
