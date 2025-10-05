import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ERROR_MESSAGES, EMAIL_REGEX } from '../../constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
  };

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  rememberMe = false;

  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        console.log('Tentando fazer login com:', this.loginData.email);

        const success = await this.authService.login(this.loginData.email, this.loginData.password);

        if (success) {
          console.log('Login realizado com sucesso!', {
            email: this.loginData.email,
            rememberMe: this.rememberMe,
          });

          // Redirecionar para página home após login
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Falha no login. Verifique suas credenciais.';
        }
      } catch (error: any) {
        console.error('Erro no login:', error);
        // Usar a mensagem de erro do Firebase se disponível
        this.errorMessage = error.message || 'Erro interno. Tente novamente.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async socialLogin(provider: string) {
    console.log('Login com:', provider);

    try {
      if (provider === 'google') {
        this.isLoading = true;
        this.errorMessage = '';

        const success = await this.authService.loginWithGoogle();
        if (success) {
          console.log('Login com Google realizado com sucesso!');
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Falha no login com Google. Tente novamente.';
        }
      } else {
        this.errorMessage = 'Login com ' + provider + ' não implementado ainda.';
      }
    } catch (error) {
      console.error('Erro no login social:', error);
      this.errorMessage = 'Erro no login social. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    console.log('Recuperação de senha solicitada');
    // Implementar recuperação de senha aqui
    alert('Funcionalidade de recuperação de senha');
  }

  private validateForm(): boolean {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = ERROR_MESSAGES.REQUIRED_FIELDS;
      return false;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = ERROR_MESSAGES.INVALID_EMAIL;
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  navigateToRegister() {
    console.log('Navegando para registro');
    this.router.navigate(['/register']).then(() => {
      console.log('Navegação para registro concluída');
    });
  }
}
