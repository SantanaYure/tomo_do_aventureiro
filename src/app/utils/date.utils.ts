/**
 * Utilitários para manipulação de datas
 */

export class DateUtils {
  /**
   * Formata data para padrão brasileiro (dd/mm/yyyy hh:mm)
   */
  static formatToBrazilian(date: Date | null | undefined): string {
    if (!date) {
      return '-';
    }

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  }

  static formatShort(date: Date | null | undefined): string {
    if (!date) {
      return '-';
    }

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return '-';
    }
  }

  static formatTime(date: Date | null | undefined): string {
    if (!date) {
      return '-';
    }

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      return dateObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  }

  static fromFirestoreTimestamp(timestamp: any): Date | null {
    if (!timestamp) {
      return null;
    }

    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }

      if (timestamp instanceof Date) {
        return timestamp;
      }

      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }

  /**
   * Verifica se a data é hoje
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Retorna data relativa (ex: "há 2 dias", "ontem", "hoje")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInDays = this.daysBetween(date, now);

    if (this.isToday(date)) {
      return 'Hoje';
    }

    if (diffInDays === 1) {
      return 'Ontem';
    }

    if (diffInDays < 7) {
      return `Há ${diffInDays} dias`;
    }

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }

    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }

    const years = Math.floor(diffInDays / 365);
    return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
}
