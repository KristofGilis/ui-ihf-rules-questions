import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, isDevMode, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TOAST_DURATION } from '../constants';
import { ToastService } from './toast.service';

/**
 * GraphQL error object from Apollo Client
 * Based on: https://the-guild.dev/graphql/apollo-angular/docs/data/error-handling
 */
interface GraphQLErrorDetail {
  message: string;
  locations?: ReadonlyArray<{ line: number; column: number }>;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

/**
 * Apollo Client error structure
 * Contains both GraphQL errors and network errors
 */
interface ApolloClientError {
  graphQLErrors?: ReadonlyArray<GraphQLErrorDetail>;
  networkError?: Error | null;
  message: string;
}

/**
 * Interface for wrapped errors (Promise rejections)
 */
interface WrappedError {
  rejection?: unknown;
  error?: unknown;
}

/**
 * Global error handler that catches all unhandled errors in the application.
 *
 * Provides:
 * - User-friendly error messages
 * - Error categorization (Network, GraphQL, Client, Unknown)
 * - Console logging in development
 *
 * Architecture:
 * - Apollo errors are first handled by ErrorLink in graphql.provider.ts
 * - ErrorLink logs Apollo errors at the link level
 * - If components don't handle Apollo errors, they bubble up here
 * - This handler provides user notifications for all unhandled errors
 * - Apollo errors skip duplicate console logging (already logged by ErrorLink)
 *
 * @example
 * // Automatically handles all errors, including:
 * // - Component errors
 * // - Service errors
 * // - HTTP/GraphQL errors (if unhandled by components)
 * // - Promise rejections
 */
@Service()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly _isDevelopment = isDevMode();
  private readonly _toastService = inject(ToastService);
  private readonly _translate = inject(TranslateService);

  handleError(error: unknown): void {
    // Extract the actual error if wrapped
    const actualError = this.unwrapError(error);

    // Categorize the error
    const errorInfo = this.categorizeError(actualError);

    // Log to console in development (but skip Apollo errors as they're already logged by ErrorLink)
    if (this._isDevelopment && !this.isApolloError(actualError)) {
      console.group(`❌ ${errorInfo.category} Error`);
      console.error('Message:', errorInfo.userMessage);
      console.error('Technical:', errorInfo.technicalMessage);
      console.error('Original Error:', actualError);
      console.groupEnd();
    }

    // Show user-friendly notification
    this.notifyUser(errorInfo);
  }

  /**
   * Unwrap nested errors to get the root cause
   */
  private unwrapError(error: unknown): unknown {
    if (this.isWrappedError(error)) {
      if (error.rejection) {
        return error.rejection; // Promise rejection
      }
      if (error.error) {
        return error.error; // HttpErrorResponse
      }
    }
    return error;
  }

  /**
   * Type guard for wrapped errors
   */
  private isWrappedError(error: unknown): error is WrappedError {
    return typeof error === 'object' && error !== null && ('rejection' in error || 'error' in error);
  }

  /**
   * Categorize errors and generate appropriate messages
   */
  private categorizeError(error: unknown): ErrorInfo {
    // Network/Connection errors
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return {
          category: 'Network',
          userMessage: this._translate.instant('errors.network_connection'),
          technicalMessage: 'Network connection failed',
          severity: 'high',
        };
      }
      if (error.status >= 500) {
        return {
          category: 'Server',
          userMessage: this._translate.instant('errors.server_error'),
          technicalMessage: `HTTP ${error.status}: ${error.message}`,
          severity: 'high',
        };
      }
      if (error.status === 404) {
        return {
          category: 'Client',
          userMessage: this._translate.instant('errors.not_found'),
          technicalMessage: `HTTP 404: ${error.url}`,
          severity: 'medium',
        };
      }
      return {
        category: 'HTTP',
        userMessage: this._translate.instant('errors.http_error'),
        technicalMessage: `HTTP ${error.status}: ${error.message}`,
        severity: 'medium',
      };
    }

    // Apollo Client / GraphQL errors
    if (this.isApolloError(error)) {
      if (error.networkError) {
        return {
          category: 'Network',
          userMessage: this._translate.instant('errors.network_connection'),
          technicalMessage: error.message || 'GraphQL network error',
          severity: 'high',
        };
      }
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        return {
          category: 'GraphQL',
          userMessage: this._translate.instant('errors.data_loading'),
          technicalMessage: firstError.message || error.message || 'GraphQL error',
          severity: 'medium',
        };
      }
      return {
        category: 'GraphQL',
        userMessage: this._translate.instant('errors.data_loading'),
        technicalMessage: error.message || 'GraphQL error',
        severity: 'medium',
      };
    }

    // Client-side JavaScript errors
    if (error instanceof Error) {
      // Ignore certain errors that are not actionable
      if (this.shouldIgnoreError(error)) {
        return {
          category: 'Ignored',
          userMessage: '',
          technicalMessage: error.message,
          severity: 'low',
        };
      }

      return {
        category: 'Client',
        userMessage: this._translate.instant('errors.client_error'),
        technicalMessage: error.message,
        severity: 'high',
      };
    }

    // Unknown error type
    return {
      category: 'Unknown',
      userMessage: this._translate.instant('errors.unknown_error'),
      technicalMessage: String(error),
      severity: 'medium',
    };
  }

  /**
   * Check if error is from Apollo Client
   * Based on the structure documented at:
   * https://the-guild.dev/graphql/apollo-angular/docs/data/error-handling
   */
  private isApolloError(error: unknown): error is ApolloClientError {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('networkError' in error || 'graphQLErrors' in error) &&
      'message' in error
    );
  }

  /**
   * Determine if error should be silently ignored
   */
  private shouldIgnoreError(error: Error): boolean {
    const ignoredMessages = [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
    ];

    return ignoredMessages.some((msg) => error.message?.includes(msg));
  }

  /**
   * Show error notification to user using toast service
   */
  private notifyUser(errorInfo: ErrorInfo): void {
    // Don't show notifications for ignored errors
    if (errorInfo.category === 'Ignored' || !errorInfo.userMessage) {
      return;
    }

    // Show notifications for high severity errors or all errors in development
    if (this._isDevelopment || errorInfo.severity === 'high') {
      const toastType = errorInfo.severity === 'high' ? 'error' : 'warning';
      const duration = errorInfo.severity === 'high' ? TOAST_DURATION.ERROR : TOAST_DURATION.WARNING;
      this._toastService.show(errorInfo.userMessage, { type: toastType, duration });
    }
  }

  /**
   * Send error to monitoring service
   * @private
   */
  // private sendToMonitoring(errorInfo: ErrorInfo, error: Error): void {
  //   // Example Sentry integration:
  //   // Sentry.captureException(error, {
  //   //   level: errorInfo.severity === 'high' ? 'error' : 'warning',
  //   //   tags: { category: errorInfo.category }
  //   // });
  // }
}

interface ErrorInfo {
  category: 'Network' | 'Server' | 'Client' | 'HTTP' | 'GraphQL' | 'Unknown' | 'Ignored';
  userMessage: string;
  technicalMessage: string;
  severity: 'low' | 'medium' | 'high';
}
