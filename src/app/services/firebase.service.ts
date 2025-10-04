import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app;
  private auth;
  private firestore;

  constructor() {
    try {
      console.log('🔥 Inicializando Firebase...');
      console.log('Configuração do Firebase:', environment.firebaseConfig);

      this.app = initializeApp(environment.firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);

      console.log('✅ Firebase inicializado com sucesso!');
      console.log('Auth:', this.auth);
      console.log('Firestore:', this.firestore);
    } catch (error) {
      console.group('❌ ERRO CRÍTICO na inicialização do Firebase:');
      console.error('Erro:', error);
      console.error('Configuração:', environment.firebaseConfig);
      console.groupEnd();
      throw error;
    }
  }

  // Login com email e senha
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Erro no login Firebase:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  // Registro com email e senha
  async createUserWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      console.log('🔥 Iniciando criação de usuário no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Usuário criado com sucesso no Firebase Auth:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.group('❌ ERRO no Firebase Auth - createUserWithEmail:');
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Email usado:', email);
      console.error('Erro completo:', error);
      console.groupEnd();

      // Relançar erro com código para tratamento no componente
      const firebaseError = new Error(this.getFirebaseErrorMessage(error.code));
      (firebaseError as any).code = error.code;
      throw firebaseError;
    }
  }

  // Login com Google
  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error: any) {
      console.error('Erro no login Google:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  // Logout
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Observador de estado de autenticação
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Usuário atual
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Salvar dados do usuário no Firestore
  async saveUserData(userData: any): Promise<void> {
    try {
      console.log('🔥 Iniciando salvamento no Firestore...');
      console.log('Dados a serem salvos:', userData);

      const userRef = doc(this.firestore, 'users', userData.uid);
      await setDoc(userRef, userData);

      console.log('✅ Dados do usuário salvos com sucesso no Firestore!');
      console.log('Caminho do documento:', `users/${userData.uid}`);
    } catch (error: any) {
      console.group('❌ ERRO no Firestore - saveUserData:');
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Dados que tentou salvar:', userData);
      console.error('Erro completo:', error);
      console.groupEnd();

      // Adicionar contexto ao erro
      const firestoreError = new Error(`Erro ao salvar no banco de dados: ${error.message}`);
      (firestoreError as any).code = error.code;
      (firestoreError as any).originalError = error;
      throw firestoreError;
    }
  }

  // Método público para acessar mensagens de erro
  getErrorMessage(errorCode: string): string {
    return this.getFirebaseErrorMessage(errorCode);
  }

  // Tradução de mensagens de erro
  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      // Erros de Authentication
      case 'auth/user-not-found':
        return '❌ Usuário não encontrado. Verifique o email ou registre-se.';
      case 'auth/wrong-password':
        return '❌ Senha incorreta. Tente novamente.';
      case 'auth/email-already-in-use':
        return '❌ Este email já está em uso. Tente fazer login ou use outro email.';
      case 'auth/weak-password':
        return '❌ A senha deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return '❌ Email inválido. Verifique se digitou corretamente.';
      case 'auth/user-disabled':
        return '❌ Esta conta foi desabilitada. Entre em contato com o suporte.';
      case 'auth/too-many-requests':
        return '❌ Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      case 'auth/network-request-failed':
        return '❌ Erro de conexão. Verifique sua internet e tente novamente.';
      case 'auth/invalid-credential':
        return '❌ Email ou senha inválidos.';
      case 'auth/operation-not-allowed':
        return '❌ Operação não permitida. Entre em contato com o suporte.';
      case 'auth/requires-recent-login':
        return '❌ Por segurança, faça login novamente.';

      // Erros do Firestore
      case 'permission-denied':
        return '❌ Permissão negada. Verifique suas credenciais.';
      case 'unavailable':
        return '❌ Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      case 'already-exists':
        return '❌ Dados já existem. Use informações diferentes.';
      case 'resource-exhausted':
        return '❌ Limite de uso excedido. Tente novamente mais tarde.';
      case 'failed-precondition':
        return '❌ Erro na configuração do sistema. Entre em contato com o suporte.';
      case 'aborted':
        return '❌ Operação interrompida. Tente novamente.';
      case 'out-of-range':
        return '❌ Dados fora do limite permitido.';
      case 'unimplemented':
        return '❌ Funcionalidade não implementada.';
      case 'internal':
        return '❌ Erro interno do servidor. Tente novamente em alguns minutos.';
      case 'data-loss':
        return '❌ Perda de dados detectada. Entre em contato com o suporte imediatamente.';
      case 'unauthenticated':
        return '❌ Não autenticado. Faça login novamente.';

      // Erro genérico
      default:
        console.warn(`⚠️  Código de erro não mapeado: ${errorCode}`);
        return `❌ Erro técnico (${errorCode}). Se o problema persistir, entre em contato com o suporte.`;
    }
  }

  // Retorna a instância do Firestore para uso externo
  getFirestore() {
    return this.firestore;
  }
}
