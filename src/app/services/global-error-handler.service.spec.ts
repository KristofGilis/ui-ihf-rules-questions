import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular';
import { GlobalErrorHandler } from './global-error-handler.service';
import { ToastService } from './toast.service';

// Mock Sentry
jest.mock('@sentry/angular', () => ({
  captureException: jest.fn(),
}));

// Mock environment
jest.mock('../../environments/environment', () => ({
  environment: {
    sentry: {
      enabled: true,
    },
  },
}));

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

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should handle generic errors', () => {
    const error = new Error('Test error');
    handler.handleError(error);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle HTTP 500 errors', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      url: '/api/test',
    });
    handler.handleError(httpError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle network errors (status 0)', () => {
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

  it('should handle generic HTTP errors (4xx)', () => {
    const httpError = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      url: '/api/test',
    });
    handler.handleError(httpError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should unwrap promise rejection errors', () => {
    const wrappedError = {
      rejection: new Error('Wrapped error'),
    };
    handler.handleError(wrappedError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should unwrap HttpErrorResponse from wrapped error', () => {
    const wrappedError = {
      error: new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      }),
    };
    handler.handleError(wrappedError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle Apollo GraphQL errors with graphQLErrors', () => {
    const apolloError = {
      message: 'GraphQL error occurred',
      graphQLErrors: [
        {
          message: 'Field error',
          locations: [{ line: 1, column: 1 }],
          path: ['user', 'name'],
        },
      ],
    };
    handler.handleError(apolloError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle Apollo GraphQL errors with networkError', () => {
    const apolloError = {
      message: 'Network error',
      networkError: new Error('Connection failed'),
    };
    handler.handleError(apolloError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should handle Apollo GraphQL errors without specific errors', () => {
    const apolloError = {
      message: 'General GraphQL error',
    };
    handler.handleError(apolloError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should ignore ResizeObserver errors', () => {
    const ignoredError = new Error('ResizeObserver loop limit exceeded');
    handler.handleError(ignoredError);
    expect(toastService.show).not.toHaveBeenCalled();
  });

  it('should ignore ResizeObserver loop completed errors', () => {
    const ignoredError = new Error('ResizeObserver loop completed with undelivered notifications');
    handler.handleError(ignoredError);
    expect(toastService.show).not.toHaveBeenCalled();
  });

  it('should ignore non-Error promise rejection errors', () => {
    const ignoredError = new Error('Non-Error promise rejection captured with value: test');
    handler.handleError(ignoredError);
    expect(toastService.show).not.toHaveBeenCalled();
  });

  it('should handle unknown error types', () => {
    const unknownError = 'string error';
    handler.handleError(unknownError);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should call translateService for error messages', () => {
    const instantSpy = jest.spyOn(translateService, 'instant');
    const error = new Error('Test');
    handler.handleError(error);
    expect(instantSpy).toHaveBeenCalled();
  });

  describe('Sentry Integration', () => {
    it('should send Network errors to Sentry with warning level', () => {
      const networkError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      });
      handler.handleError(networkError);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        networkError,
        expect.objectContaining({
          level: 'warning',
          tags: { errorCategory: 'Network' },
        })
      );
    });

    it('should send HTTP errors to Sentry with error level', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      });
      handler.handleError(httpError);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        httpError,
        expect.objectContaining({
          level: 'error',
          tags: { errorCategory: 'Server' },
        })
      );
    });

    it('should send GraphQL errors to Sentry with error level', () => {
      const apolloError = {
        message: 'GraphQL error',
        graphQLErrors: [{ message: 'Field error' }],
      };
      handler.handleError(apolloError);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        apolloError,
        expect.objectContaining({
          level: 'error',
          tags: { errorCategory: 'GraphQL' },
        })
      );
    });

    it('should send Client errors to Sentry with warning level', () => {
      const clientError = new Error('Client error');
      handler.handleError(clientError);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        clientError,
        expect.objectContaining({
          level: 'warning',
          tags: { errorCategory: 'Client' },
        })
      );
    });

    it('should send Unknown errors to Sentry with error level', () => {
      const unknownError = { custom: 'error object' };
      handler.handleError(unknownError);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        unknownError,
        expect.objectContaining({
          level: 'error',
          tags: { errorCategory: 'Unknown' },
        })
      );
    });

    it('should include error context in Sentry report', () => {
      const error = new Error('Test error');
      handler.handleError(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          contexts: expect.objectContaining({
            errorInfo: expect.objectContaining({
              category: 'Client',
              userMessage: expect.any(String),
              technicalMessage: expect.any(String),
            }),
          }),
        })
      );
    });
  });

  describe('Toast Notifications', () => {
    it('should show error toast for high severity errors', () => {
      const error = new HttpErrorResponse({ status: 0 });
      handler.handleError(error);
      expect(toastService.show).toHaveBeenCalledWith(expect.any(String), {
        type: 'error',
        duration: expect.any(Number),
      });
    });

    it('should not show toast for ignored errors', () => {
      const ignoredError = new Error('ResizeObserver loop limit exceeded');
      handler.handleError(ignoredError);
      expect(toastService.show).not.toHaveBeenCalled();
    });

    it('should handle 404 errors with appropriate message', () => {
      const instantSpy = jest.spyOn(translateService, 'instant');
      const notFoundError = new HttpErrorResponse({
        status: 404,
        url: '/api/missing',
      });
      handler.handleError(notFoundError);
      expect(instantSpy).toHaveBeenCalledWith('errors.not_found');
    });

    it('should handle server errors with appropriate message', () => {
      const instantSpy = jest.spyOn(translateService, 'instant');
      const serverError = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
      });
      handler.handleError(serverError);
      expect(instantSpy).toHaveBeenCalledWith('errors.server_error');
    });
  });
});
