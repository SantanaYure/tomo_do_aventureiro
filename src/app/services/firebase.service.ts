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
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
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
      this.app = initializeApp(environment.firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
    } catch (error) {
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async createUserWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const firebaseError = new Error(this.getFirebaseErrorMessage(error.code));
      (firebaseError as any).code = error.code;
      throw firebaseError;
    }
  }

  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error: any) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);

      if (signInMethods.length === 0) {
        throw new Error('❌ Email não cadastrado. Verifique o email ou crie uma nova conta.');
      }

      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      if (error.message.includes('não cadastrado')) {
        throw error;
      }
      throw new Error(this.getFirebaseErrorMessage(error.code));
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

  // Aguardar autenticação ser verificada
  async waitForAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      // Se já tem usuário, retorna imediatamente
      if (this.auth.currentUser) {
        resolve(this.auth.currentUser);
        return;
      }

      // Aguarda a verificação de autenticação
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });

      // Timeout de 5 segundos
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 5000);
    });
  }

  async saveUserData(userData: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userData.uid);
      await setDoc(userRef, userData);
    } catch (error: any) {
      const firestoreError = new Error(`Erro ao salvar no banco de dados: ${error.message}`);
      (firestoreError as any).code = error.code;
      (firestoreError as any).originalError = error;
      throw firestoreError;
    }
  }

  getErrorMessage(errorCode: string): string {
    return this.getFirebaseErrorMessage(errorCode);
  }

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
      case 'invalid-argument':
        return '❌ Dados inválidos enviados ao servidor. Verifique os campos preenchidos.';
      case 'not-found':
        return '❌ Recurso não encontrado.';
      case 'cancelled':
        return '❌ Operação cancelada.';
      case 'deadline-exceeded':
        return '❌ Tempo limite excedido. Tente novamente.';

      default:
        return `❌ Erro técnico (${errorCode}). Se o problema persistir, entre em contato com o suporte.`;
    }
  }
  getFirestore() {
    return this.firestore;
  }

  async getTemplates() {
    try {
      const templatesCollection = collection(this.firestore, 'templates');
      const snapshot = await getDocs(templatesCollection);
      return snapshot;
    } catch (error: any) {
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async getTemplateById(id: string) {
    try {
      const templateDoc = doc(this.firestore, 'templates', id);
      const snapshot = await getDoc(templateDoc);

      if (snapshot.exists()) {
        return snapshot;
      } else {
        throw new Error('Template não encontrado');
      }
    } catch (error: any) {
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async addCharacterSheet(sheetData: any) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      if (!sheetData.nome || typeof sheetData.nome !== 'string') {
        throw new Error('Nome do personagem é obrigatório e deve ser texto.');
      }

      if (!sheetData.templateId || typeof sheetData.templateId !== 'string') {
        throw new Error('Template ID é obrigatório.');
      }

      const sheetCollection = collection(this.firestore, 'personagens');

      const dataToSave = {
        templateId: sheetData.templateId,
        templateNome: sheetData.templateNome || '',
        nome: sheetData.nome.trim(),
        campos: sheetData.campos || {},
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(sheetCollection, dataToSave);
      return docRef;
    } catch (error: any) {
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async getUserCharacterSheets() {
    try {
      const user = await this.waitForAuth();

      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const sheetCollection = collection(this.firestore, 'personagens');
      const q = query(sheetCollection, where('ownerId', '==', user.uid));

      const snapshot = await getDocs(q);
      return snapshot;
    } catch (error: any) {
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async getCharacterSheetById(sheetId: string) {
    try {
      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (snapshot.exists()) {
        const user = this.getCurrentUser();
        const sheetData = snapshot.data();

        if (user && sheetData['ownerId'] !== user.uid) {
          throw new Error('Você não tem permissão para acessar esta ficha.');
        }

        return snapshot;
      } else {
        throw new Error('Ficha não encontrada');
      }
    } catch (error: any) {
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async updateCharacterSheet(sheetId: string, dataToUpdate: any) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (!snapshot.exists()) {
        throw new Error('Ficha não encontrada');
      }

      const sheetData = snapshot.data();
      if (sheetData['ownerId'] !== user.uid) {
        throw new Error('Você não tem permissão para editar esta ficha.');
      }

      const updateData = {
        ...dataToUpdate,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(sheetDoc, updateData);
    } catch (error: any) {
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  async deleteCharacterSheet(sheetId: string) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (!snapshot.exists()) {
        throw new Error('Ficha não encontrada');
      }

      const sheetData = snapshot.data();
      if (sheetData['ownerId'] !== user.uid) {
        throw new Error('Você não tem permissão para deletar esta ficha.');
      }

      await deleteDoc(sheetDoc);
    } catch (error: any) {
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }
}
