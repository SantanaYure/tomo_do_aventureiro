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
      case 'invalid-argument':
        return '❌ Dados inválidos enviados ao servidor. Verifique os campos preenchidos.';
      case 'not-found':
        return '❌ Recurso não encontrado.';
      case 'cancelled':
        return '❌ Operação cancelada.';
      case 'deadline-exceeded':
        return '❌ Tempo limite excedido. Tente novamente.';

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

  // ========================================
  // MÉTODOS PARA TEMPLATES (READ)
  // ========================================

  /**
   * Busca a lista de todos os templates de ficha disponíveis.
   * @returns Uma Promise com os documentos dos templates.
   */
  async getTemplates() {
    try {
      const templatesCollection = collection(this.firestore, 'templates');
      const snapshot = await getDocs(templatesCollection);

      console.log(`✅ ${snapshot.size} template(s) encontrado(s)`);
      return snapshot;
    } catch (error: any) {
      console.error('❌ Erro ao buscar templates:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  /**
   * Busca a estrutura detalhada de um template específico pelo seu ID.
   * @param id O ID do documento do template.
   * @returns Uma Promise com o documento do template.
   */
  async getTemplateById(id: string) {
    try {
      const templateDoc = doc(this.firestore, 'templates', id);
      const snapshot = await getDoc(templateDoc);

      if (snapshot.exists()) {
        console.log(`✅ Template '${id}' encontrado`);
        return snapshot;
      } else {
        console.warn(`⚠️  Template '${id}' não encontrado`);
        throw new Error('Template não encontrado');
      }
    } catch (error: any) {
      console.error(`❌ Erro ao buscar template '${id}':`, error);
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  // ========================================
  // MÉTODOS PARA FICHAS DE PERSONAGEM (CRUD)
  // ========================================

  /**
   * Cria uma nova ficha de personagem no Firestore.
   * @param sheetData Os dados iniciais da ficha (ex: nome, templateId, campos).
   * @returns Uma Promise com a referência do novo documento criado.
   */
  async addCharacterSheet(sheetData: any) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      // Validações básicas
      if (!sheetData.nome || typeof sheetData.nome !== 'string') {
        throw new Error('Nome do personagem é obrigatório e deve ser texto.');
      }

      if (!sheetData.templateId || typeof sheetData.templateId !== 'string') {
        throw new Error('Template ID é obrigatório.');
      }

      const sheetCollection = collection(this.firestore, 'personagens');

      // Adiciona o ID do dono (ownerId) para segurança e referência
      const dataToSave = {
        templateId: sheetData.templateId,
        templateNome: sheetData.templateNome || '',
        nome: sheetData.nome.trim(),
        campos: sheetData.campos || {},
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('🔥 Criando ficha de personagem:', dataToSave);
      const docRef = await addDoc(sheetCollection, dataToSave);
      console.log(`✅ Ficha criada com sucesso! ID: ${docRef.id}`);

      return docRef;
    } catch (error: any) {
      console.error('❌ Erro ao criar ficha:', error);
      console.error('Dados enviados:', sheetData);
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  /**
   * Busca todas as fichas de personagem do usuário atualmente logado.
   * @returns Uma Promise com os documentos das fichas do usuário.
   */
  async getUserCharacterSheets() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const sheetCollection = collection(this.firestore, 'personagens');
      // Cria uma query que filtra os documentos pelo ownerId
      const q = query(sheetCollection, where('ownerId', '==', user.uid));

      console.log(`🔍 Buscando fichas do usuário: ${user.uid}`);
      const snapshot = await getDocs(q);
      console.log(`✅ ${snapshot.size} ficha(s) encontrada(s)`);

      return snapshot;
    } catch (error: any) {
      console.error('❌ Erro ao buscar fichas do usuário:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  /**
   * Busca os dados completos de uma ficha de personagem específica pelo seu ID.
   * @param sheetId O ID do documento da ficha.
   * @returns Uma Promise com o documento da ficha.
   */
  async getCharacterSheetById(sheetId: string) {
    try {
      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (snapshot.exists()) {
        console.log(`✅ Ficha '${sheetId}' encontrada`);

        // Verificar se o usuário atual é o dono da ficha
        const user = this.getCurrentUser();
        const sheetData = snapshot.data();

        if (user && sheetData['ownerId'] !== user.uid) {
          console.warn(`⚠️  Usuário não autorizado a acessar ficha '${sheetId}'`);
          throw new Error('Você não tem permissão para acessar esta ficha.');
        }

        return snapshot;
      } else {
        console.warn(`⚠️  Ficha '${sheetId}' não encontrada`);
        throw new Error('Ficha não encontrada');
      }
    } catch (error: any) {
      console.error(`❌ Erro ao buscar ficha '${sheetId}':`, error);
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  /**
   * Atualiza os dados de uma ficha de personagem existente.
   * @param sheetId O ID do documento da ficha a ser atualizada.
   * @param dataToUpdate Um objeto com os campos a serem atualizados.
   * @returns Uma Promise que resolve quando a atualização é concluída.
   */
  async updateCharacterSheet(sheetId: string, dataToUpdate: any) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      // Verificar se o usuário é o dono da ficha antes de atualizar
      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (!snapshot.exists()) {
        throw new Error('Ficha não encontrada');
      }

      const sheetData = snapshot.data();
      if (sheetData['ownerId'] !== user.uid) {
        throw new Error('Você não tem permissão para editar esta ficha.');
      }

      // Adiciona timestamp de atualização
      const updateData = {
        ...dataToUpdate,
        updatedAt: new Date().toISOString(),
      };

      console.log(`🔄 Atualizando ficha '${sheetId}'`);
      await updateDoc(sheetDoc, updateData);
      console.log(`✅ Ficha '${sheetId}' atualizada com sucesso`);
    } catch (error: any) {
      console.error(`❌ Erro ao atualizar ficha '${sheetId}':`, error);
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }

  /**
   * Deleta uma ficha de personagem.
   * @param sheetId O ID do documento da ficha a ser deletada.
   * @returns Uma Promise que resolve quando a deleção é concluída.
   */
  async deleteCharacterSheet(sheetId: string) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      // Verificar se o usuário é o dono da ficha antes de deletar
      const sheetDoc = doc(this.firestore, 'personagens', sheetId);
      const snapshot = await getDoc(sheetDoc);

      if (!snapshot.exists()) {
        throw new Error('Ficha não encontrada');
      }

      const sheetData = snapshot.data();
      if (sheetData['ownerId'] !== user.uid) {
        throw new Error('Você não tem permissão para deletar esta ficha.');
      }

      console.log(`🗑️  Deletando ficha '${sheetId}'`);
      await deleteDoc(sheetDoc);
      console.log(`✅ Ficha '${sheetId}' deletada com sucesso`);
    } catch (error: any) {
      console.error(`❌ Erro ao deletar ficha '${sheetId}':`, error);
      throw new Error(error.message || this.getFirebaseErrorMessage(error.code || 'internal'));
    }
  }
}
