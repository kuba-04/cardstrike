/**
 * Error service for providing user-friendly error messages
 */

// Known error types
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

// Map of user-friendly error messages
const ERROR_MESSAGES = {
  [ErrorType.AUTHENTICATION]: "Authentication failed. Please check your credentials and try again.",
  [ErrorType.DATABASE]: "We're experiencing database issues. Please try again later.",
  [ErrorType.VALIDATION]: "Please check your input and try again.",
  [ErrorType.NETWORK]: "Network error. Please check your connection and try again.",
  [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again later.",
};

/**
 * Provides user-friendly error messages
 */
export const ErrorService = {
  /**
   * Determines the error type based on the error message
   */
  getErrorType(message: string): ErrorType {
    if (!message) return ErrorType.UNKNOWN;
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('password') || 
        lowerMessage.includes('auth') || 
        lowerMessage.includes('login') || 
        lowerMessage.includes('credential')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (lowerMessage.includes('database') || 
        lowerMessage.includes('postgres') || 
        lowerMessage.includes('db') || 
        lowerMessage.includes('sql') || 
        lowerMessage.includes('query')) {
      return ErrorType.DATABASE;
    }
    
    if (lowerMessage.includes('invalid') || 
        lowerMessage.includes('required') || 
        lowerMessage.includes('must be') || 
        lowerMessage.includes('format')) {
      return ErrorType.VALIDATION;
    }
    
    if (lowerMessage.includes('network') || 
        lowerMessage.includes('connection') || 
        lowerMessage.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    return ErrorType.UNKNOWN;
  },
  
  /**
   * Gets a user-friendly message based on error type
   */
  getUserFriendlyMessage(errorType: ErrorType): string {
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ErrorType.UNKNOWN];
  },
  
  /**
   * Formats an error for display to the user
   */
  formatError(error: unknown): string {
    if (error instanceof Error) {
      const errorType = this.getErrorType(error.message);
      return this.getUserFriendlyMessage(errorType);
    }
    
    if (typeof error === 'string') {
      const errorType = this.getErrorType(error);
      return this.getUserFriendlyMessage(errorType);
    }
    
    return ERROR_MESSAGES[ErrorType.UNKNOWN];
  }
}; 