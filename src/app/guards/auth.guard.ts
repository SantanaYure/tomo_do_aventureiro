import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('🔒 Guard: Verificando autenticação...');

    // Verificar se há token no localStorage
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      console.log('✅ Guard: Usuário autenticado, permitindo acesso');
      return true;
    }

    console.log('❌ Guard: Usuário não autenticado, redirecionando para login');
    this.router.navigate(['/login']);
    return false;
  }
}
