import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      // Simulação de cadastro - aqui você integraria com seu serviço de autenticação
      setTimeout(() => {
        console.log('Cadastro realizado com sucesso!', this.registerData);
        alert(
          'Cadastro realizado com sucesso!\nBem-vindo ao Tomo do Aventureiro!\n\nClique em OK para fazer login.'
        );
        this.isLoading = false;
        // Só redireciona após o usuário clicar em OK no alert
        this.router.navigate(['/login']);
      }, 2000);
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
      !this.registerData.cpf ||
      !this.registerData.phone ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return false;
    }

    // Verificar email válido
    if (!this.isValidEmail(this.registerData.email)) {
      this.errorMessage = 'Por favor, insira um email válido';
      return false;
    }

    // Verificar CPF válido
    if (!this.isValidCPF(this.registerData.cpf)) {
      this.errorMessage = 'Por favor, insira um CPF válido';
      return false;
    }

    // Verificar telefone válido
    if (!this.isValidPhone(this.registerData.phone)) {
      this.errorMessage = 'Por favor, insira um telefone válido';
      return false;
    }

    // Verificar senha forte
    if (this.registerData.password.length < 8) {
      this.errorMessage = 'A senha deve ter pelo menos 8 caracteres';
      return false;
    }

    if (!this.isStrongPassword(this.registerData.password)) {
      this.errorMessage =
        'A senha deve conter pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial';
      return false;
    }

    // Verificar se senhas coincidem
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem';
      return false;
    }

    // Verificar termos de uso (LGPD)
    if (!this.acceptTerms) {
      this.errorMessage = 'Você deve aceitar os Termos de Uso e Política de Privacidade';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
    return strongRegex.test(password);
  }

  private isValidCPF(cpf: string): boolean {
    // Remove pontos e hífens
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    sum = 0;

    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }

    return true;
  }

  private isValidPhone(phone: string): boolean {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');

    // Verifica se tem 10 ou 11 dígitos (telefone fixo ou celular)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }

  showTermsModal() {
    // Implementar modal com termos de uso
    alert('Aqui seriam exibidos os Termos de Uso e Política de Privacidade completos');
  }
}
