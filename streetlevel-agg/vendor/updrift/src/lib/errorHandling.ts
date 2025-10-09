// Error types for different API scenarios
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error context for better debugging
export interface ErrorContext {
  endpoint?: string;
  params?: any;
  userId?: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

// Standardized error response
export interface ErrorResponse {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string; // User-friendly message
  code?: string;
  retryAfter?: number; // For rate limiting
  context?: ErrorContext;
  originalError?: any;
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorResponse[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Parse different types of errors
  parseError(error: any, context?: Partial<ErrorContext>): ErrorResponse {
    const baseContext: ErrorContext = {
      timestamp: Date.now(),
      ...context
    };

    // Network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: 'Request timeout',
        userMessage: 'The request took too long. Please try again.',
        context: baseContext,
        originalError: error
      };
    }

    // Rate limiting
    if (error.response?.status === 429) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryAfter: error.response.headers['retry-after'] ? 
          parseInt(error.response.headers['retry-after']) : 60,
        context: baseContext,
        originalError: error
      };
    }

    // Authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Authentication failed',
        userMessage: 'Please sign in again to continue.',
        context: baseContext,
        originalError: error
      };
    }

    // API errors (4xx, 5xx)
    if (error.response?.status >= 400) {
      return {
        type: ErrorType.API_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: `API Error: ${error.response.status}`,
        userMessage: this.getUserFriendlyMessage(error.response.status),
        code: error.response.status.toString(),
        context: baseContext,
        originalError: error
      };
    }

    // Network errors
    if (!error.response && error.request) {
      return {
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Network error',
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        context: baseContext,
        originalError: error
      };
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.type === 'validation') {
      return {
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.LOW,
        message: 'Validation error',
        userMessage: 'Please check your input and try again.',
        context: baseContext,
        originalError: error
      };
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      context: baseContext,
      originalError: error
    };
  }

  // Get user-friendly error messages
  private getUserFriendlyMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please sign in to continue.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Log error for monitoring
  logError(errorResponse: ErrorResponse): void {
    this.errorLog.push(errorResponse);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', {
        type: errorResponse.type,
        severity: errorResponse.severity,
        message: errorResponse.message,
        userMessage: errorResponse.userMessage,
        context: errorResponse.context
      });
    }

    // In production, you could send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      this.sendToMonitoringService(errorResponse);
    }
  }

  // Send error to monitoring service
  private sendToMonitoringService(errorResponse: ErrorResponse): void {
    // TODO: Implement monitoring service integration
    // Example: Sentry.captureException(errorResponse.originalError);
  }

  // Get recent errors
  getRecentErrors(limit: number = 10): ErrorResponse[] {
    return this.errorLog.slice(-limit);
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check if error is retryable
  isRetryableError(errorResponse: ErrorResponse): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.RATE_LIMIT_ERROR
    ].includes(errorResponse.type);
  }

  // Get retry delay for rate limiting
  getRetryDelay(errorResponse: ErrorResponse): number {
    if (errorResponse.type === ErrorType.RATE_LIMIT_ERROR && errorResponse.retryAfter) {
      return errorResponse.retryAfter * 1000; // Convert to milliseconds
    }
    return 5000; // Default 5 second delay
  }
}

// Utility functions for common error handling patterns
export const errorUtils = {
  // Handle API errors with automatic retry
  async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    const errorHandler = ErrorHandler.getInstance();
    let lastError: ErrorResponse | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const errorResponse = errorHandler.parseError(error, context);
        errorHandler.logError(errorResponse);

        lastError = errorResponse;

        // Don't retry if error is not retryable
        if (!errorHandler.isRetryableError(errorResponse)) {
          throw errorResponse;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw errorResponse;
        }

        // Wait before retrying
        const delay = errorHandler.getRetryDelay(errorResponse);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  },

  // Handle errors with fallback
  async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    try {
      return await primaryFn();
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      const errorResponse = errorHandler.parseError(error, context);
      errorHandler.logError(errorResponse);

      // Try fallback
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        const fallbackErrorResponse = errorHandler.parseError(fallbackError, context);
        errorHandler.logError(fallbackErrorResponse);
        throw fallbackErrorResponse;
      }
    }
  },

  // Create error response for Next.js API routes
  createApiErrorResponse(errorResponse: ErrorResponse) {
    return {
      status: 'error',
      message: errorResponse.userMessage,
      error: {
        type: errorResponse.type,
        severity: errorResponse.severity,
        code: errorResponse.code,
        retryAfter: errorResponse.retryAfter
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance(); 