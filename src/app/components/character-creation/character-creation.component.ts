import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

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

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-creation.component.html',
  styleUrls: ['./character-creation.component.css'],
})
export class CharacterCreationComponent implements OnInit {
  // Estados
  step: 'select-template' | 'fill-form' | 'success' = 'select-template';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Templates
  templates: Template[] = [];
  selectedTemplate: Template | null = null;

  // Formulário
  characterName = '';
  formData: { [key: string]: string } = {};

  // Sistema de Abas
  activeTabIndex = 0;

  // Timeout para redirecionamento
  private redirectTimeout?: number;

  constructor(private firebaseService: FirebaseService, public router: Router) {}

  async ngOnInit() {
    await this.loadTemplates();
  }

  // ========================================
  // CARREGAR TEMPLATES
  // ========================================

  async loadTemplates() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const snapshot = await this.firebaseService.getTemplates();

      this.templates = [];
      snapshot.forEach((doc) => {
        this.templates.push({
          id: doc.id,
          ...(doc.data() as Omit<Template, 'id'>),
        });
      });

      console.log(`✅ ${this.templates.length} template(s) carregado(s)`);
    } catch (error: any) {
      console.error('❌ Erro ao carregar templates:', error);
      this.errorMessage = error.message || 'Erro ao carregar templates';
    } finally {
      this.isLoading = false;
    }
  }

  // ========================================
  // SELECIONAR TEMPLATE
  // ========================================

  selectTemplate(template: Template) {
    this.selectedTemplate = template;
    this.step = 'fill-form';
    this.errorMessage = '';
    this.activeTabIndex = 0;

    // Inicializar formData com campos vazios
    this.formData = {};

    template.estrutura.forEach((bloco) => {
      bloco.campos.forEach((campo) => {
        this.formData[campo.name] = '';
      });
    });

    console.log('Template selecionado:', template.nome);
  }

  // ========================================
  // VOLTAR PARA SELEÇÃO
  // ========================================

  backToTemplateSelection() {
    this.step = 'select-template';
    this.selectedTemplate = null;
    this.characterName = '';
    this.formData = {};
    this.errorMessage = '';
    this.activeTabIndex = 0;
  }

  // ========================================
  // NAVEGAÇÃO ENTRE ABAS
  // ========================================

  selectTab(index: number) {
    this.activeTabIndex = index;
    this.errorMessage = ''; // Limpar erro ao mudar de aba
  }

  nextTab() {
    if (this.selectedTemplate && this.activeTabIndex < this.selectedTemplate.estrutura.length - 1) {
      this.activeTabIndex++;
    }
  }

  previousTab() {
    if (this.activeTabIndex > 0) {
      this.activeTabIndex--;
    }
  }

  // ========================================
  // VALIDAR FORMULÁRIO
  // ========================================

  validateForm(): boolean {
    // O primeiro campo do primeiro bloco é obrigatório (geralmente o nome)
    if (
      !this.selectedTemplate ||
      this.selectedTemplate.estrutura.length === 0 ||
      this.selectedTemplate.estrutura[0].campos.length === 0
    ) {
      this.errorMessage = '❌ Template inválido';
      return false;
    }

    const firstField = this.selectedTemplate.estrutura[0].campos[0];
    const firstFieldValue = this.formData[firstField.name] || '';

    console.log('🔍 Validação - Campo:', firstField.name, 'Valor:', firstFieldValue);
    console.log('🔍 Validação - FormData completo:', this.formData);

    if (!firstFieldValue.trim()) {
      this.errorMessage = `❌ Por favor, preencha o campo "${firstField.label}"`;
      this.activeTabIndex = 0; // Voltar para a primeira aba
      return false;
    }

    // Usar o primeiro campo como characterName
    this.characterName = firstFieldValue.trim();

    console.log('✅ Validação OK - Nome do personagem:', this.characterName);

    return true;
  }

  // ========================================
  // SALVAR PERSONAGEM
  // ========================================

  async saveCharacter() {
    if (!this.validateForm() || !this.selectedTemplate) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Limpar campos vazios e undefined do formData
      const cleanedFormData: { [key: string]: string } = {};

      Object.keys(this.formData).forEach((key) => {
        const value = this.formData[key];
        if (value !== null && value !== undefined && value !== '') {
          cleanedFormData[key] = String(value).trim();
        }
      });

      const sheetData = {
        templateId: this.selectedTemplate.id,
        templateNome: this.selectedTemplate.nome,
        nome: this.characterName.trim(),
        campos: cleanedFormData,
      };

      console.log('📤 Enviando dados para o Firebase:', sheetData);

      const docRef = await this.firebaseService.addCharacterSheet(sheetData);

      console.log('✅ Personagem criado com sucesso! ID:', docRef.id);

      this.successMessage = `✅ ${this.characterName} foi criado com sucesso!`;
      this.step = 'success';

      // Redirecionar após 2 segundos
      this.redirectTimeout = window.setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 2000);
    } catch (error: any) {
      console.error('❌ Erro ao criar personagem:', error);
      this.errorMessage = error.message || 'Erro ao criar personagem';
    } finally {
      this.isLoading = false;
    }
  }

  // ========================================
  // CRIAR OUTRO PERSONAGEM
  // ========================================

  createAnother() {
    this.step = 'select-template';
    this.selectedTemplate = null;
    this.characterName = '';
    this.formData = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.activeTabIndex = 0;
  }

  // ========================================
  // CANCELAR E VOLTAR
  // ========================================

  cancel() {
    if (confirm('Deseja realmente cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/home']);
    }
  }

  // Cleanup ao destruir componente
  ngOnDestroy() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
}
