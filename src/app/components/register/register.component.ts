import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { ERROR_MESSAGES, EMAIL_REGEX, PASSWORD_RULES } from '../../constants/app.constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  async onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // Criar usuário no Firebase Authentication
        const user = await this.firebaseService.createUserWithEmail(
          this.registerData.email,
          this.registerData.password
        );

        if (user) {
          // Salvar dados adicionais no Firestore
          const userData = {
            uid: user.uid,
            firstName: this.registerData.firstName,
            lastName: this.registerData.lastName,
            nickname: this.registerData.nickname,
            email: this.registerData.email,
            createdAt: new Date(),
            emailVerified: false,
          };

          await this.firebaseService.saveUserData(userData);

          console.log('Cadastro realizado com sucesso!', userData);
          alert(
            'Cadastro realizado com sucesso!\nBem-vindo ao Tomo do Aventureiro!\n\nClique em OK para fazer login.'
          );

          this.isLoading = false;
          this.router.navigate(['/login']);
        }
      } catch (error: any) {
        this.isLoading = false;

        // Log detalhado para o desenvolvedor
        console.group('🔥 ERRO NO CADASTRO - Detalhes para Developer:');
        console.error('Erro completo:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem original:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('Dados do formulário:', this.registerData);
        console.groupEnd();

        // Verificar se é erro do Firebase Auth ou Firestore
        if (error.code) {
          // Erro do Firebase com código específico
          this.errorMessage = this.firebaseService.getErrorMessage(error.code);
        } else if (error.message) {
          // Erro customizado ou do Firestore
          if (error.message.includes('network')) {
            this.errorMessage = '❌ Erro de conexão. Verifique sua internet e tente novamente.';
          } else if (error.message.includes('permission')) {
            this.errorMessage = '❌ Erro de permissão. Entre em contato com o suporte.';
          } else if (error.message.includes('quota')) {
            this.errorMessage = '❌ Limite de uso excedido. Tente novamente em alguns minutos.';
          } else {
            this.errorMessage = `❌ Erro técnico: ${error.message}`;
          }
        } else {
          // Erro genérico
          this.errorMessage =
            '❌ Erro inesperado. Verifique os dados e tente novamente. Se o problema persistir, entre em contato com o suporte.';
        }

        // Alerta adicional para erros críticos
        if (error.message && error.message.includes('Firebase')) {
          console.warn('⚠️  ATENÇÃO: Erro relacionado ao Firebase - Verifique a configuração!');
        }
      }
    }
  }

  navigateToLogin() {
    console.log('Navegando para login');
    this.router.navigate(['/login']).then(() => {
      console.log('Navegação para login concluída');
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  socialLogin(provider: string) {
    console.log('Login social com:', provider);
    // Implementar login social aqui
    alert('Cadastro com ' + provider.charAt(0).toUpperCase() + provider.slice(1));
  }

  private validateForm(): boolean {
    // Verificar campos obrigatórios
    if (
      !this.registerData.firstName ||
      !this.registerData.lastName ||
      !this.registerData.nickname ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
      this.errorMessage = ERROR_MESSAGES.REQUIRED_FIELDS;
      return false;
    }

    // Verificar email válido
    if (!this.isValidEmail(this.registerData.email)) {
      this.errorMessage = ERROR_MESSAGES.INVALID_EMAIL;
      return false;
    }

    // Verificar senha forte
    if (this.registerData.password.length < PASSWORD_RULES.RECOMMENDED_LENGTH) {
      this.errorMessage = `A senha deve ter pelo menos ${PASSWORD_RULES.RECOMMENDED_LENGTH} caracteres`;
      return false;
    }

    if (!this.isStrongPassword(this.registerData.password)) {
      this.errorMessage = ERROR_MESSAGES.PASSWORD_WEAK;
      return false;
    }

    // Verificar se senhas coincidem
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
      return false;
    }

    // Verificar termos de uso (LGPD)
    if (!this.acceptTerms) {
      this.errorMessage = ERROR_MESSAGES.TERMS_NOT_ACCEPTED;
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return PASSWORD_RULES.REGEX.test(password);
  }

  showTermsModal() {
    // Implementar modal com termos de uso
    alert('Aqui seriam exibidos os Termos de Uso e Política de Privacidade completos');
  }
}
