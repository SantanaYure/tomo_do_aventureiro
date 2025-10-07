import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verificar se há token no localStorage
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      // Validar se o token ainda é válido
      const token = this.authService.getToken();

      if (token) {
        try {
          // Verificar se o token JWT não está expirado
          const tokenPayload = this.parseJwt(token);
          const currentTime = Math.floor(Date.now() / 1000);

          // Se o token expirou, fazer logout
          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            console.warn('⚠️ Guard: Token expirado, redirecionando para login');
            this.authService.logout();
            return false;
          }

          return true;
        } catch (error) {
          // Se houver erro ao parsear o token, é inválido
          console.error('❌ Guard: Token inválido, redirecionando para login');
          this.authService.logout();
          return false;
        }
      }
    }

    this.router.navigate(['/login']);
    return false;
  }

  // Método auxiliar para decodificar JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token JWT inválido');
    }
  }
}
