import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { DateUtils } from '../../utils/date.utils';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

interface Campo {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}

interface Bloco {
  bloco: string;
  icone: string;
  campos: Campo[];
}

interface Template {
  id: string;
  nome: string;
  descricao: string;
  estrutura: Bloco[];
}

interface Character {
  id: string;
  nome: string;
  templateId: string;
  templateNome: string;
  campos: { [key: string]: any };
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-character-view',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  templateUrl: './character-view.html',
  styleUrls: ['./character-view.css'],
})
export class CharacterViewComponent implements OnInit {
  // Estados
  isLoading = true;
  errorMessage = '';

  // Dados do personagem
  character: Character | null = null;
  template: Template | null = null;
  characterId: string | null = null;

  // Sistema de Abas
  activeTabIndex = 0;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Capturar ID da URL
    this.route.params.subscribe(async (params) => {
      if (params['id']) {
        this.characterId = params['id'];
        if (this.characterId) {
          await this.loadCharacter(this.characterId);
        }
      } else {
        this.errorMessage = 'ID do personagem não fornecido';
        this.isLoading = false;
      }
    });
  }

  // ========================================
  // CARREGAR PERSONAGEM
  // ========================================

  async loadCharacter(characterId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('📥 Carregando personagem para visualização...', characterId);
      const characterDoc = await this.firebaseService.getCharacterSheetById(characterId);

      if (!characterDoc.exists()) {
        throw new Error('Personagem não encontrado');
      }

      const characterData = characterDoc.data();
      console.log('📦 Dados do personagem:', characterData);

      // Processar datas - suporta tanto Timestamp quanto string ISO
      let createdAt: Date | null = null;
      let updatedAt: Date | null = null;

      // Tentar converter createdAt
      if (characterData['createdAt']) {
        if (typeof characterData['createdAt'].toDate === 'function') {
          // É um Timestamp do Firestore
          createdAt = characterData['createdAt'].toDate();
        } else if (typeof characterData['createdAt'] === 'string') {
          // É uma string ISO
          createdAt = new Date(characterData['createdAt']);
        } else if (characterData['createdAt'] instanceof Date) {
          // Já é um Date
          createdAt = characterData['createdAt'];
        }
      }

      // Tentar converter updatedAt
      if (characterData['updatedAt']) {
        if (typeof characterData['updatedAt'].toDate === 'function') {
          // É um Timestamp do Firestore
          updatedAt = characterData['updatedAt'].toDate();
        } else if (typeof characterData['updatedAt'] === 'string') {
          // É uma string ISO
          updatedAt = new Date(characterData['updatedAt']);
        } else if (characterData['updatedAt'] instanceof Date) {
          // Já é um Date
          updatedAt = characterData['updatedAt'];
        }
      }

      // Se não houver updatedAt, usar createdAt
      if (!updatedAt && createdAt) {
        updatedAt = createdAt;
      }

      this.character = {
        id: characterDoc.id,
        nome: characterData['nome'] || 'Personagem Sem Nome',
        templateId: characterData['templateId'],
        templateNome: characterData['templateNome'] || 'Template Desconhecido',
        campos: characterData['dados'] || characterData['campos'] || {},
        createdAt: createdAt,
        updatedAt: updatedAt,
      };

      console.log('📦 Personagem carregado:', this.character);

      // Carregar template
      if (this.character.templateId) {
        await this.loadTemplate(this.character.templateId);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar personagem:', error);
      console.error('Stack trace:', error.stack);
      this.errorMessage = error.message || 'Erro ao carregar personagem';
      setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 3000);
    } finally {
      this.isLoading = false;
    }
  }

  // ========================================
  // CARREGAR TEMPLATE
  // ========================================

  async loadTemplate(templateId: string) {
    try {
      console.log('📋 Carregando template...');
      const templateDoc = await this.firebaseService.getTemplateById(templateId);

      if (!templateDoc.exists()) {
        console.warn('Template não encontrado');
        return;
      }

      const templateData = templateDoc.data();
      this.template = {
        id: templateDoc.id,
        nome: templateData['nome'],
        descricao: templateData['descricao'],
        estrutura: templateData['estrutura'],
      };

      console.log('✅ Template carregado:', this.template.nome);
    } catch (error: any) {
      console.error('❌ Erro ao carregar template:', error);
      // Não bloqueia a visualização se o template não carregar
    }
  }

  // ========================================
  // OBTER VALOR DO CAMPO
  // ========================================

  getFieldValue(fieldName: string): string {
    if (!this.character || !this.character.campos) {
      return '-';
    }

    // Verificar em basicInfo (estrutura antiga)
    if (this.character.campos['basicInfo']) {
      const value = this.character.campos['basicInfo'][fieldName];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    // Verificar direto nos campos
    const value = this.character.campos[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }

    return '-';
  }

  // ========================================
  // NAVEGAÇÃO ENTRE ABAS
  // ========================================

  selectTab(index: number) {
    this.activeTabIndex = index;
  }

  nextTab() {
    if (this.template && this.activeTabIndex < this.template.estrutura.length - 1) {
      this.activeTabIndex++;
    }
  }

  previousTab() {
    if (this.activeTabIndex > 0) {
      this.activeTabIndex--;
    }
  }

  // ========================================
  // AÇÕES
  // ========================================

  editCharacter() {
    if (this.characterId) {
      this.router.navigate(['/create-character', this.characterId]);
    }
  }

  goBack() {
    this.router.navigate(['/my-characters']);
  }

  deleteCharacter() {
    if (!this.character || !this.characterId) return;

    const confirmMessage = `Deseja realmente excluir "${this.character.nome}"?\n\nEsta ação não pode ser desfeita!`;

    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.firebaseService
        .deleteCharacterSheet(this.characterId)
        .then(() => {
          console.log('✅ Personagem excluído com sucesso');
          this.router.navigate(['/my-characters']);
        })
        .catch((error) => {
          console.error('❌ Erro ao excluir personagem:', error);
          this.errorMessage = 'Erro ao excluir personagem. Tente novamente.';
          this.isLoading = false;
        });
    }
  }

  // ========================================
  // FORMATAÇÃO
  // ========================================

  formatDate(date: Date | null): string {
    return DateUtils.formatToBrazilian(date);
  }
}
