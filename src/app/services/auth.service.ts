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

  // Login com Firebase Authentication
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('Tentando login com Firebase:', { email });

      // Primeiro, autentica com Firebase
      const firebaseUser = await this.firebaseService.signInWithEmail(email, password);

      if (firebaseUser) {
        console.log('Usuário autenticado no Firebase:', firebaseUser.uid);

        // Busca dados adicionais do usuário na API
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await this.getUserDataFromAPI(token);

          // Salva o token e dados do usuário
          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));

          this.currentUserSubject.next(userData);
          console.log('Login realizado com sucesso');
          return true;
        } catch (apiError) {
          console.warn('Erro ao buscar dados da API, usando dados do Firebase:', apiError);

          // Fallback: usa dados do Firebase se API não disponível
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
      console.error('Erro no login:', error);
      throw error; // Propaga o erro para o componente mostrar a mensagem correta
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.firebaseService.signOut();
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpa dados locais
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

  // Login com Google usando Firebase
  async loginWithGoogle(): Promise<boolean> {
    try {
      console.log('Iniciando login com Google via Firebase...');

      const firebaseUser = await this.firebaseService.signInWithGoogle();

      if (firebaseUser) {
        console.log('Usuário autenticado no Firebase via Google:', firebaseUser.uid);

        // Criar dados do usuário baseado no Firebase
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          nome: firebaseUser.displayName?.split(' ')[0] || 'Google',
          sobrenome: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
          nickname: firebaseUser.displayName || 'Google User',
          photoURL: firebaseUser.photoURL || undefined,
        };

        // Gerar token Firebase
        const token = await firebaseUser.getIdToken();

        // Salvar dados
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        this.currentUserSubject.next(userData);

        console.log('Login com Google realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login com Google:', error);
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

  // Busca dados do usuário na API
  async getUserData(): Promise<User | null> {
    try {
      const response = await this.http.get<User>(`${this.apiUrl}/users/me`).toPromise();
      return response || null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  // Recuperação de senha
  async resetPassword(email: string): Promise<void> {
    try {
      await this.firebaseService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error;
    }
  }
}
