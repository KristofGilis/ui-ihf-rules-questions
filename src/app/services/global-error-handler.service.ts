import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

/**
 * Global error handler that catches all unhandled errors in the application.
 *
 * Provides:
 * - User-friendly error messages
 * - Error categorization (Network, GraphQL, Client, Unknown)
 * - Console logging in development
 * - Integration point for error monitoring services (Sentry, etc.)
 *
 * @example
 * // Automatically handles all errors, including:
 * // - Component errors
 * // - Service errors
 * // - HTTP/GraphQL errors
 * // - Promise rejections
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly isDevelopment = isDevMode();

  handleError(error: unknown): void {
    // Extract the actual error if wrapped
    const actualError = this.unwrapError(error);

    // Categorize the error
    const errorInfo = this.categorizeError(actualError);

    // Log to console in development
    if (this.isDevelopment) {
      console.group(`❌ ${errorInfo.category} Error`);
      console.error('Message:', errorInfo.userMessage);
      console.error('Technical:', errorInfo.technicalMessage);
      console.error('Original Error:', actualError);
      console.groupEnd();
    }

    // Show user-friendly notification
    this.notifyUser(errorInfo);

    // TODO: Send to error monitoring service (Sentry, Azure Application Insights, etc.)
    // this.sendToMonitoring(errorInfo, actualError);
  }

  /**
   * Unwrap nested errors to get the root cause
   */
  private unwrapError(error: any): Error {
    if (error?.rejection) {
      return error.rejection; // Promise rejection
    }
    if (error?.error) {
      return error.error; // HttpErrorResponse
    }
    return error;
  }

  /**
   * Categorize errors and generate appropriate messages
   */
  private categorizeError(error: any): ErrorInfo {
    // Network/Connection errors
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return {
          category: 'Network',
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
          technicalMessage: 'Network connection failed',
          severity: 'high',
        };
      }
      if (error.status >= 500) {
        return {
          category: 'Server',
          userMessage: 'The server encountered an error. Please try again later.',
          technicalMessage: `HTTP ${error.status}: ${error.message}`,
          severity: 'high',
        };
      }
      if (error.status === 404) {
        return {
          category: 'Client',
          userMessage: 'The requested resource was not found.',
          technicalMessage: `HTTP 404: ${error.url}`,
          severity: 'medium',
        };
      }
      return {
        category: 'HTTP',
        userMessage: 'An error occurred while communicating with the server.',
        technicalMessage: `HTTP ${error.status}: ${error.message}`,
        severity: 'medium',
      };
    }

    // GraphQL errors
    if (this.isGraphQLError(error)) {
      const networkError = (error as any).networkError;
      if (networkError) {
        return {
          category: 'Network',
          userMessage: 'Unable to reach the server. Please check your connection.',
          technicalMessage: (error as any).message || 'GraphQL network error',
          severity: 'high',
        };
      }
      return {
        category: 'GraphQL',
        userMessage: 'An error occurred while loading data. Please try again.',
        technicalMessage: (error as any).message || 'GraphQL error',
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
        userMessage: 'An unexpected error occurred. Please refresh the page.',
        technicalMessage: error.message,
        severity: 'high',
      };
    }

    // Unknown error type
    return {
      category: 'Unknown',
      userMessage: 'Something went wrong. Please try again.',
      technicalMessage: String(error),
      severity: 'medium',
    };
  }

  /**
   * Check if error is from Apollo/GraphQL
   */
  private isGraphQLError(error: any): boolean {
    return error?.networkError !== undefined || error?.graphQLErrors !== undefined;
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
   * Show error notification to user
   */
  private notifyUser(errorInfo: ErrorInfo): void {
    // Don't show notifications for ignored errors
    if (errorInfo.category === 'Ignored' || !errorInfo.userMessage) {
      return;
    }

    // Use browser's built-in notification (simple approach)
    // In a real app, you'd want to use a toast/snackbar component
    if (this.isDevelopment || errorInfo.severity === 'high') {
      // For now, just log the user message
      // TODO: Replace with toast notification service
      console.warn('⚠️ User Notification:', errorInfo.userMessage);

      // Example: this.toastService.error(errorInfo.userMessage);
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
