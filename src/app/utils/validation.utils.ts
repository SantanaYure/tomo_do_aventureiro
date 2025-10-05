/**
 * Utilitários de validação
 * Funções reutilizáveis para validação de dados
 */

import { EMAIL_REGEX, PASSWORD_RULES } from '../constants/app.constants';

export class ValidationUtils {
  /**
   * Valida se um email é válido
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return EMAIL_REGEX.test(email.trim());
  }

  /**
   * Valida se uma senha é forte
   */
  static isStrongPassword(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }
    return (
      password.length >= PASSWORD_RULES.RECOMMENDED_LENGTH && PASSWORD_RULES.REGEX.test(password)
    );
  }

  /**
   * Valida se uma string não está vazia
   */
  static isNotEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  }

  /**
   * Valida se um objeto tem propriedades obrigatórias
   */
  static hasRequiredFields<T extends object>(obj: T, requiredFields: (keyof T)[]): boolean {
    return requiredFields.every((field) => {
      const value = obj[field];
      return value !== null && value !== undefined && value !== '';
    });
  }

  /**
   * Sanitiza string removendo espaços e caracteres especiais perigosos
   */
  static sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Valida UID do Firebase
   */
  static isValidFirebaseUID(uid: string): boolean {
    return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
  }

  /**
   * Valida se um número está dentro de um intervalo
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && value >= min && value <= max;
  }

  /**
   * Valida comprimento de string
   */
  static isValidLength(str: string, minLength: number, maxLength: number): boolean {
    if (!str || typeof str !== 'string') {
      return false;
    }
    const length = str.trim().length;
    return length >= minLength && length <= maxLength;
  }
}
