import { Injectable } from '@angular/core';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root',
})
export class BootstrapService {
  constructor() {}

  // Método para inicializar tooltips
  initTooltips(): void {
    if (typeof bootstrap !== 'undefined') {
      const tooltipTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }

  // Método para inicializar popovers
  initPopovers(): void {
    if (typeof bootstrap !== 'undefined') {
      const popoverTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="popover"]')
      );
      popoverTriggerList.forEach((popoverTriggerEl) => {
        new bootstrap.Popover(popoverTriggerEl);
      });
    }
  }

  // Método para abrir modal programaticamente
  openModal(modalId: string): void {
    if (typeof bootstrap !== 'undefined') {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para fechar modal programaticamente
  closeModal(modalId: string): void {
    if (typeof bootstrap !== 'undefined') {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    }
  }
}
