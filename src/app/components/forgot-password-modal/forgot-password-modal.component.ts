import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EMAIL_REGEX } from '../../constants/app.constants';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.css'],
})
export class ForgotPasswordModalComponent {
  @Output() close = new EventEmitter<void>();

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  async onSubmit() {
    // Limpar mensagens anteriores
    this.errorMessage = '';
    this.successMessage = '';

    // Validar email
    if (!this.email) {
      this.errorMessage = 'Por favor, informe seu email.';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor, informe um email válido.';
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.resetPassword(this.email);
      this.successMessage =
        'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada e spam.';

      // Fechar modal após 3 segundos
      setTimeout(() => {
        this.closeModal();
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      this.errorMessage = error.message || 'Erro ao enviar email. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  closeModal() {
    this.close.emit();
  }

  handleOverlayClick(event: MouseEvent) {
    // Fechar modal apenas se clicar no overlay (fundo escuro)
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
