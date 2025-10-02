import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      // Simulação de login - aqui você integraria com seu serviço de autenticação
      setTimeout(() => {
        if (this.loginData.email === 'admin@rpg.com' && this.loginData.password === '123456') {
          console.log('Login realizado com sucesso!', {
            email: this.loginData.email,
            rememberMe: this.rememberMe,
          });
          // Redirecionar para página principal após login
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Email ou senha inválidos';
        }
        this.isLoading = false;
      }, 1500);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  socialLogin(provider: string) {
    console.log('Login com:', provider);
    // Implementar login social aqui
    alert('Login com ' + provider.charAt(0).toUpperCase() + provider.slice(1));
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    console.log('Recuperação de senha solicitada');
    // Implementar recuperação de senha aqui
    alert('Funcionalidade de recuperação de senha');
  }

  private validateForm(): boolean {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return false;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Por favor, insira um email válido';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  navigateToRegister() {
    console.log('Navegando para registro');
    // this.router.navigate(['/register']);
    alert('Funcionalidade de criar nova conta');
  }
}
