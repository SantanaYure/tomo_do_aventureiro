/**
 * Classe para erros customizados da aplicação
 */
export class AppError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Erros de autenticação
 */
export class AuthError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(message, code, originalError);
    this.name = 'AuthError';
  }
}

/**
 * Erros de validação
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erros de rede/API
 */
export class NetworkError extends AppError {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ErrorHandler {
  static getUserFriendlyMessage(error: any): string {
    if (error instanceof AppError) {
      return error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Erro inesperado. Tente novamente mais tarde.';
  }

  static logError(error: any, context?: string): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
    };
  }

  static isNetworkError(error: any): boolean {
    return (
      error instanceof NetworkError ||
      error?.code === 'network-request-failed' ||
      error?.message?.includes('network') ||
      error?.message?.includes('conexão')
    );
  }

  static isAuthError(error: any): boolean {
    return (
      error instanceof AuthError ||
      error?.code?.startsWith('auth/') ||
      error?.code === 'unauthenticated'
    );
  }
}
