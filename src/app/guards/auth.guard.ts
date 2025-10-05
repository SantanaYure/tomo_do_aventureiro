import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    console.log('🔒 Guard: Verificando autenticação...');

    // 1. Verificar localStorage
    const hasToken = this.authService.isLoggedIn();

    if (!hasToken) {
      console.log('❌ Guard: Sem token no localStorage');
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Verificar Firebase (pode estar restaurando)
    const firebaseUser = this.firebaseService.getCurrentUser();

    if (firebaseUser) {
      console.log('✅ Guard: Firebase user OK');
      return true;
    }

    // 3. Firebase ainda não restaurou - aguardar um pouco
    console.log('⏳ Guard: Aguardando Firebase restaurar sessão...');

    const userAfterWait = await this.waitForFirebaseAuth();

    if (userAfterWait) {
      console.log('✅ Guard: Sessão restaurada com sucesso');
      return true;
    }

    // 4. Firebase não restaurou = sessão expirada
    console.log('❌ Guard: Sessão expirada, redirecionando para login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
    return false;
  }

  private waitForFirebaseAuth(): Promise<any> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10; // Máximo 2 segundos (10 x 200ms)

      const checkAuth = () => {
        const user = this.firebaseService.getCurrentUser();

        if (user) {
          resolve(user);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkAuth, 200); // Verificar a cada 200ms
        } else {
          resolve(null); // Timeout após 2 segundos
        }
      };

      checkAuth();
    });
  }
}
