import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      const token = this.authService.getToken();

      if (token) {
        try {
          const tokenPayload = this.parseJwt(token);
          const currentTime = Math.floor(Date.now() / 1000);

          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            this.authService.logout();
            return false;
          }

          return true;
        } catch (error) {
          this.authService.logout();
          return false;
        }
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
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
