import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

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
 * - Integration point for error monitoring services (Sentry, etc.)
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
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly isDevelopment = isDevMode();

  handleError(error: unknown): void {
    // Extract the actual error if wrapped
    const actualError = this.unwrapError(error);

    // Categorize the error
    const errorInfo = this.categorizeError(actualError);

    // Log to console in development (but skip Apollo errors as they're already logged by ErrorLink)
    if (this.isDevelopment && !this.isApolloError(actualError)) {
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

    // Apollo Client / GraphQL errors
    if (this.isApolloError(error)) {
      if (error.networkError) {
        return {
          category: 'Network',
          userMessage: 'Unable to reach the server. Please check your connection.',
          technicalMessage: error.message || 'GraphQL network error',
          severity: 'high',
        };
      }
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        return {
          category: 'GraphQL',
          userMessage: 'An error occurred while loading data. Please try again.',
          technicalMessage: firstError.message || error.message || 'GraphQL error',
          severity: 'medium',
        };
      }
      return {
        category: 'GraphQL',
        userMessage: 'An error occurred while loading data. Please try again.',
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
   * Show error notification to user
   */
  private notifyUser(errorInfo: ErrorInfo): void {
    // Don't show notifications for ignored errors
    if (errorInfo.category === 'Ignored' || !errorInfo.userMessage) {
      return;
    }

    // Show notifications for high severity errors or all errors in development
    if (this.isDevelopment || errorInfo.severity === 'high') {
      this.showInlineNotification(errorInfo);
    }
  }

  /**
   * Display a simple inline notification to the user
   * Uses a styled div that auto-dismisses after 5 seconds
   */
  private showInlineNotification(errorInfo: ErrorInfo): void {
    const notification = document.createElement('div');
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // Style based on severity
    const bgColor = errorInfo.severity === 'high' ? '#dc2626' : '#f59e0b';
    const icon = errorInfo.severity === 'high' ? '❌' : '⚠️';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px 20px;
      background-color: ${bgColor};
      color: white;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: start;">
        <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">Error</div>
          <div>${this.escapeHtml(errorInfo.userMessage)}</div>
        </div>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; flex-shrink: 0;"
          aria-label="Close notification"
        >×</button>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
