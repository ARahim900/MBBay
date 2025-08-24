import type { ContractorError } from '../types/contractor';

/**
 * ContractorErrorHandler - Centralized error handling for contractor operations
 * Provides user-friendly error messages and fallback strategies
 */
export class ContractorErrorHandler {
  /**
   * Handle API errors with context-specific messages
   */
  static handleAPIError(error: Error, context: string): string {
    console.error(`Contractor API Error [${context}]:`, error);
    
    try {
      // Try to parse structured error
      const parsedError: ContractorError = JSON.parse(error.message);
      return parsedError.message;
    } catch {
      // Handle generic errors
      const message = error.message.toLowerCase();
      
      // Network errors
      if (message.includes('fetch') || message.includes('network')) {
        return 'Network connection error. Please check your internet connection and try again.';
      }
      
      // Authentication errors
      if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
        return 'Authentication error. Please refresh the page and try again.';
      }
      
      // Server errors
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return 'Server error. Please try again later.';
      }
      
      // Validation errors
      if (message.includes('400') || message.includes('422') || message.includes('invalid')) {
        return 'Invalid data provided. Please check your input and try again.';
      }
      
      // Conflict errors
      if (message.includes('409') || message.includes('conflict')) {
        return 'Data conflict. The record may have been modified by another user. Please refresh and try again.';
      }
      
      // Not found errors
      if (message.includes('404') || message.includes('not found')) {
        return 'The requested contractor record was not found.';
      }
      
      return `An unexpected error occurred while ${context.toLowerCase()}. Please try again.`;
    }
  }

  /**
   * Execute operation with fallback data on error
   */
  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = this.handleAPIError(error as Error, context);
      console.warn(`Using fallback data for ${context}: ${errorMessage}`);
      
      // You could emit an event here to show a toast notification
      this.notifyError(errorMessage, context);
      
      return fallback;
    }
  }

  /**
   * Execute operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry on client errors (4xx)
        const message = error.message.toLowerCase();
        if (message.includes('400') || message.includes('401') || 
            message.includes('403') || message.includes('404') || 
            message.includes('422')) {
          break;
        }
        
        console.warn(`Attempt ${attempt} failed for ${context}, retrying in ${delay}ms...`);
        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  /**
   * Validate contractor data before API calls
   */
  static validateContractorData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.contractor_name || data.contractor_name.trim().length < 2) {
      errors.push('Contractor name must be at least 2 characters long');
    }

    if (!data.service_provided || data.service_provided.trim().length < 10) {
      errors.push('Service description must be at least 10 characters long');
    }

    if (!data.status || !['Active', 'Expired', 'Pending'].includes(data.status)) {
      errors.push('Status must be Active, Expired, or Pending');
    }

    if (!data.contract_type || !['Contract', 'PO'].includes(data.contract_type)) {
      errors.push('Contract type must be Contract or PO');
    }

    if (!data.start_date || !this.isValidDate(data.start_date)) {
      errors.push('Start date is required and must be a valid date');
    }

    if (!data.end_date || !this.isValidDate(data.end_date)) {
      errors.push('End date is required and must be a valid date');
    }

    // Date validation
    if (data.start_date && data.end_date && this.isValidDate(data.start_date) && this.isValidDate(data.end_date)) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    // Amount validation
    if (data.contract_monthly_amount !== null && data.contract_monthly_amount !== undefined) {
      if (typeof data.contract_monthly_amount !== 'number' || data.contract_monthly_amount < 0) {
        errors.push('Monthly amount must be a positive number');
      }
    }

    if (data.contract_yearly_amount !== null && data.contract_yearly_amount !== undefined) {
      if (typeof data.contract_yearly_amount !== 'number' || data.contract_yearly_amount < 0) {
        errors.push('Yearly amount must be a positive number');
      }
    }

    // String length validation
    if (data.contractor_name && data.contractor_name.length > 255) {
      errors.push('Contractor name must be less than 255 characters');
    }

    if (data.service_provided && data.service_provided.length > 1000) {
      errors.push('Service description must be less than 1000 characters');
    }

    if (data.notes && data.notes.length > 2000) {
      errors.push('Notes must be less than 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if a string is a valid date
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Sleep utility for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Notify error to user (placeholder for toast notifications)
   */
  private static notifyError(message: string, context: string): void {
    // This could be connected to a toast notification system
    console.warn(`Error notification [${context}]: ${message}`);
    
    // Example: If you have a global notification system
    // window.dispatchEvent(new CustomEvent('contractor-error', { 
    //   detail: { message, context } 
    // }));
  }

  /**
   * Log error for monitoring/debugging
   */
  static logError(error: Error, context: string, additionalData?: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      additionalData,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Contractor Error Log:', errorLog);
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or a custom logging endpoint
  }

  /**
   * Create user-friendly error messages for specific operations
   */
  static getOperationErrorMessage(operation: string, error: Error): string {
    const baseMessage = this.handleAPIError(error, operation);
    
    switch (operation.toLowerCase()) {
      case 'creating contractor':
        return `Failed to create contractor: ${baseMessage}`;
      case 'updating contractor':
        return `Failed to update contractor: ${baseMessage}`;
      case 'deleting contractor':
        return `Failed to delete contractor: ${baseMessage}`;
      case 'fetching contractors':
        return `Failed to load contractors: ${baseMessage}`;
      case 'searching contractors':
        return `Search failed: ${baseMessage}`;
      case 'exporting data':
        return `Export failed: ${baseMessage}`;
      default:
        return baseMessage;
    }
  }
}