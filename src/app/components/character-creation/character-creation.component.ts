import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class CharacterCreationComponent implements OnInit, OnDestroy {
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
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  // NOVO: Modo de edição
  isEditMode = false;
  characterId: string | null = null;
  originalCharacterData: any = null;

  constructor(
    private firebaseService: FirebaseService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Verificar se há ID na rota (modo edição)
    this.route.params.subscribe(async (params) => {
      if (params['id']) {
        this.characterId = params['id'];
        this.isEditMode = true;
        console.log('✏️ Modo de edição ativado para personagem:', this.characterId);
        if (this.characterId) {
          await this.loadCharacterForEdit(this.characterId);
        }
      } else {
        console.log('✨ Modo de criação ativado');
        await this.loadTemplates();
      }
    });
  }

  // ========================================
  // NOVO: CARREGAR PERSONAGEM PARA EDIÇÃO
  // ========================================

  async loadCharacterForEdit(characterId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('📥 Carregando personagem para edição...');
      const characterDoc = await this.firebaseService.getCharacterSheetById(characterId);

      if (!characterDoc.exists()) {
        throw new Error('Personagem não encontrado');
      }

      const characterData = characterDoc.data();
      this.originalCharacterData = characterData;

      console.log('📦 Dados do personagem carregados:', characterData);

      // Carregar o template usado
      const templateId = characterData['templateId'];
      if (!templateId) {
        throw new Error('Template do personagem não encontrado');
      }

      const templateDoc = await this.firebaseService.getTemplateById(templateId);
      if (!templateDoc.exists()) {
        throw new Error('Template não existe no banco de dados');
      }

      const templateData = templateDoc.data();
      this.selectedTemplate = {
        id: templateDoc.id,
        nome: templateData['nome'],
        descricao: templateData['descricao'],
        estrutura: templateData['estrutura'],
      };

      console.log('📋 Template carregado:', this.selectedTemplate.nome);

      // Preencher o formulário com os dados existentes
      this.populateFormWithCharacterData(characterData);

      // Ir direto para o formulário
      this.step = 'fill-form';
    } catch (error: any) {
      console.error('❌ Erro ao carregar personagem:', error);
      this.errorMessage = error.message || 'Erro ao carregar personagem para edição';
      // Redirecionar de volta após erro
      setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 3000);
    } finally {
      this.isLoading = false;
    }
  }

  // ========================================
  // NOVO: PREENCHER FORMULÁRIO COM DADOS
  // ========================================

  populateFormWithCharacterData(characterData: any) {
    // Obter o nome do personagem
    this.characterName =
      characterData['dados']?.['basicInfo']?.['nomeDoPersonagem'] || characterData['nome'] || '';

    console.log('📝 Nome do personagem:', this.characterName);

    // Inicializar formData
    this.formData = {};

    // Preencher campos do formulário
    const campos = characterData['dados'] || characterData['campos'] || {};

    // Se os dados estão em basicInfo ou outras estruturas aninhadas
    if (campos['basicInfo']) {
      Object.keys(campos['basicInfo']).forEach((key) => {
        this.formData[key] = campos['basicInfo'][key] || '';
      });
    }

    // Se os dados estão diretamente em campos
    Object.keys(campos).forEach((key) => {
      if (typeof campos[key] === 'string' || typeof campos[key] === 'number') {
        this.formData[key] = String(campos[key]) || '';
      }
    });

    console.log('📝 Formulário preenchido:', this.formData);
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
    if (this.isEditMode) {
      // Se estiver editando, voltar para lista
      this.router.navigate(['/my-characters']);
    } else {
      this.step = 'select-template';
      this.selectedTemplate = null;
      this.characterName = '';
      this.formData = {};
      this.errorMessage = '';
      this.activeTabIndex = 0;
    }
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
  // SALVAR OU ATUALIZAR PERSONAGEM
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

      if (this.isEditMode && this.characterId) {
        // MODO EDIÇÃO: Atualizar personagem existente
        console.log('💾 Atualizando personagem:', this.characterId);

        const updateData = {
          nome: this.characterName.trim(),
          campos: cleanedFormData,
        };

        await this.firebaseService.updateCharacterSheet(this.characterId, updateData);
        console.log('✅ Personagem atualizado com sucesso!');

        this.successMessage = `✅ ${this.characterName} foi atualizado com sucesso!`;
      } else {
        // MODO CRIAÇÃO: Criar novo personagem
        console.log('💾 Salvando novo personagem...');

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
      }

      this.step = 'success';

      // Redirecionar após 2 segundos
      this.redirectTimeout = setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 2000);
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);

      if (error.code === 'invalid-argument') {
        this.errorMessage = '❌ Dados inválidos enviados ao servidor. Verifique os campos.';
      } else {
        this.errorMessage = error.message || 'Erro ao salvar o personagem. Tente novamente.';
      }
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
    const confirmMessage = this.isEditMode
      ? 'Deseja cancelar a edição? As alterações não salvas serão perdidas.'
      : 'Deseja realmente cancelar? Todos os dados serão perdidos.';

    if (confirm(confirmMessage)) {
      if (this.isEditMode) {
        this.router.navigate(['/my-characters']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  // Cleanup ao destruir componente
  ngOnDestroy() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
}
