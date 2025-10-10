import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/app.constants';

/**
 * Serviço centralizado para gerenciar o localStorage
 * Facilita testes, manutenção e adiciona segurança
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Falha ao salvar dados: ${key}`);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      return null;
    }
  }

  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new Error(`Falha ao salvar dados: ${key}`);
    }
  }

  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {}
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  getAuthToken(): string | null {
    return this.getString(STORAGE_KEYS.AUTH_TOKEN);
  }

  setAuthToken(token: string): void {
    this.setString(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  removeAuthToken(): void {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getCurrentUser<T>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.CURRENT_USER);
  }

  setCurrentUser<T>(user: T): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  removeCurrentUser(): void {
    this.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  clearAuthData(): void {
    this.removeAuthToken();
    this.removeCurrentUser();
  }
}
