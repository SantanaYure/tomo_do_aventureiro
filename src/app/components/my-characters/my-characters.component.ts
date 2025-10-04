import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { DatePipe } from '@angular/common';

interface Character {
  id: string;
  nome: string;
  templateNome: string;
  createdAt: any; // Manter como 'any' para flexibilidade com Timestamps do Firestore
  updatedAt: any;
  [key: string]: any;
}

@Component({
  selector: 'app-my-characters',
  standalone: true,
  imports: [CommonModule, DatePipe], // Adicionar DatePipe aqui
  templateUrl: './my-characters.component.html',
  styleUrls: ['./my-characters.component.css'],
})
export class MyCharactersComponent implements OnInit {
  characters: Character[] = [];
  isLoading = true; // Iniciar como true para mostrar o loading
  errorMessage = '';

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.loadCharacters();
  }

  async loadCharacters() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const snapshot = await this.firebaseService.getUserCharacterSheets();

      if (snapshot.empty) {
        console.log('Nenhum personagem encontrado para este usuário.');
        this.characters = [];
        this.isLoading = false;
        return;
      }

      const charactersPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log('📦 Dados brutos do documento:', doc.id, data);

        // --- LÓGICA CORRIGIDA PARA OBTER O NOME ---
        // Caminho correto: data -> dados -> basicInfo -> nomeDoPersonagem
        const nome =
          data['dados']?.['basicInfo']?.['nomeDoPersonagem'] ||
          data['nome'] ||
          'Personagem Sem Nome';

        // Lógica para obter o nome do template
        let templateNome = 'Template Desconhecido';
        if (data['templateId']) {
          try {
            const templateDoc = await this.firebaseService.getTemplateById(data['templateId']);
            if (templateDoc.exists()) {
              templateNome = templateDoc.data()['nome'] || 'Template Desconhecido';
            }
          } catch (e) {
            console.warn(`Não foi possível carregar o nome do template para a ficha ${doc.id}`);
          }
        }

        // Convertendo Timestamps do Firestore para Date
        const createdAt = data['createdAt']?.toDate ? data['createdAt'].toDate() : null;
        const updatedAt = data['updatedAt']?.toDate
          ? data['updatedAt'].toDate()
          : createdAt || null;

        return {
          id: doc.id,
          nome: nome,
          templateNome: templateNome,
          createdAt: createdAt,
          updatedAt: updatedAt,
          ...data,
        } as Character;
      });

      this.characters = await Promise.all(charactersPromises);

      console.log(`✅ ${this.characters.length} personagem(ns) carregado(s)`);
      console.log('📋 Lista de personagens processada:', this.characters);
    } catch (error: any) {
      console.error('❌ Erro ao carregar personagens:', error);
      this.errorMessage =
        error.message || 'Ocorreu um erro desconhecido ao carregar os personagens.';
    } finally {
      this.isLoading = false;
    }
  }

  createNew() {
    // Navega para a rota de criação de personagem
    this.router.navigate(['/character-creation']);
  }

  viewCharacter(id: string) {
    // Navega para a rota de edição/visualização, passando o ID
    this.router.navigate(['/character-creation', id]);
  }

  editCharacter(id: string) {
    // A mesma rota de visualização pode servir para edição
    this.router.navigate(['/character-creation', id]);
  }

  async deleteCharacter(id: string, name: string) {
    // Usar um modal customizado em vez de `confirm` futuramente
    if (window.confirm(`Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        await this.firebaseService.deleteCharacterSheet(id);
        // Recarrega a lista após a exclusão
        await this.loadCharacters();
        console.log('✅ Personagem excluído com sucesso');
      } catch (error: any) {
        console.error('❌ Erro ao excluir:', error);
        this.errorMessage = 'Não foi possível excluir o personagem. Tente novamente.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack() {
    // Voltar para a página principal do dashboard, por exemplo
    this.router.navigate(['/character-creation']);
  }

  // Método auxiliar para formatar datas (compatibilidade com o template)
  formatDate(date: any): Date | null {
    if (!date) return null;
    // Se já é uma Date, retorna direto
    if (date instanceof Date) return date;
    // Se tem método toDate (Timestamp do Firestore)
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    // Tentar converter string para Date
    try {
      return new Date(date);
    } catch {
      return null;
    }
  }
}
