import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { GoogleSignInService } from './google-signin.service';
import { FirebaseService } from './firebase.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface User {
  uid: string;
  email: string;
  nome: string;
  sobrenome: string;
  nickname?: string;
  cpf?: string;
  telefone?: string;
  photoURL?: string; // URL da foto do perfil
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private googleSignIn: GoogleSignInService,
    private firebaseService: FirebaseService
  ) {
    // Verifica se há um usuário logado no localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const firebaseUser = await this.firebaseService.signInWithEmail(email, password);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await this.getUserDataFromAPI(token);

          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));

          this.currentUserSubject.next(userData);
          return true;
        } catch (apiError) {
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || email,
            nome: firebaseUser.displayName?.split(' ')[0] || 'Usuário',
            sobrenome: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            nickname: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
          };

          const token = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));

          this.currentUserSubject.next(userData);
          return true;
        }
      }

      return false;
    } catch (error: any) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.firebaseService.signOut();
    } catch (error) {
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  // Verifica se está logado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Obtém o usuário atual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtém o token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  async loginWithGoogle(): Promise<boolean> {
    try {
      const firebaseUser = await this.firebaseService.signInWithGoogle();

      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          nome: firebaseUser.displayName?.split(' ')[0] || 'Google',
          sobrenome: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
          nickname: firebaseUser.displayName || 'Google User',
          photoURL: firebaseUser.photoURL || undefined,
        };

        const token = await firebaseUser.getIdToken();

        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        this.currentUserSubject.next(userData);

        return true;
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  // Busca dados do usuário na API usando token Firebase
  private async getUserDataFromAPI(token: string): Promise<User> {
    const response = await this.http
      .get<User>(`${this.apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .toPromise();

    if (!response) {
      throw new Error('Resposta da API vazia');
    }

    return response;
  }

  async getUserData(): Promise<User | null> {
    try {
      const response = await this.http.get<User>(`${this.apiUrl}/users/me`).toPromise();
      return response || null;
    } catch (error) {
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.firebaseService.sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }
}
