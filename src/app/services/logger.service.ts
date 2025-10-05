import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  // Configurar nível de log baseado no ambiente
  private logLevel: LogLevel = environment.production ? LogLevel.ERROR : LogLevel.DEBUG;

  debug(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.DEBUG, '🐛', message, optionalParams);
  }

  info(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.INFO, 'ℹ️', message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.WARN, '⚠️', message, optionalParams);
  }

  error(message: string, error?: any, ...optionalParams: any[]): void {
    this.log(LogLevel.ERROR, '❌', message, optionalParams);
    if (error) {
      console.error(error);
    }
  }

  success(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.INFO, '✅', message, optionalParams);
  }

  group(title: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(title);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  private log(level: LogLevel, icon: string, message: string, params: any[]): void {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toLocaleTimeString();
      const formattedMessage = `${icon} [${timestamp}] ${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          console.log(formattedMessage, ...params);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, ...params);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...params);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...params);
          break;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  // Método para alterar nível de log em runtime (útil para debug)
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}
