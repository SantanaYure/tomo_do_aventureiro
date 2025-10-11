import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { SidebarService } from '../../services/sidebar.service';

interface Campo {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  accept?: string;
  helpText?: string;
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
  imports: [CommonModule, FormsModule, SharedHeaderComponent],
  templateUrl: './character-creation.component.html',
  styleUrls: ['./character-creation.component.css'],
})
export class CharacterCreationComponent implements OnInit, OnDestroy {
  step: 'select-template' | 'fill-form' | 'success' = 'select-template';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  templates: Template[] = [];
  selectedTemplate: Template | null = null;

  characterName = '';
  formData: { [key: string]: string } = {};

  activeTabIndex = 0;

  private redirectTimeout?: ReturnType<typeof setTimeout>;

  isEditMode = false;
  characterId: string | null = null;
  originalCharacterData: any = null;

  isSidebarCollapsed = false;
  papelNaTramaOptions = [
    'Protagonista',
    'Antagonista',
    'Deuteragonista',
    'Mentor',
    'Ajudante/Aliado',
    'Trapaceiro/Brincalhão (Trickster)',
    'Guardião do Limiar',
    'Mensageiro',
    'Sombra',
  ];

  constructor(
    private firebaseService: FirebaseService,
    public router: Router,
    private route: ActivatedRoute,
    private sidebarService: SidebarService
  ) {}

  async ngOnInit() {
    this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });

    this.route.params.subscribe(async (params) => {
      if (params['id']) {
        this.characterId = params['id'];
        this.isEditMode = true;
        if (this.characterId) {
          await this.loadCharacterForEdit(this.characterId);
        }
      } else {
        await this.loadTemplates();
      }
    });
  }

  async loadCharacterForEdit(characterId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const characterDoc = await this.firebaseService.getCharacterSheetById(characterId);

      if (!characterDoc.exists()) {
        throw new Error('Personagem não encontrado');
      }

      const characterData = characterDoc.data();
      this.originalCharacterData = characterData;

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

      this.populateFormWithCharacterData(characterData);

      this.step = 'fill-form';
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar personagem para edição';
      setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 3000);
    } finally {
      this.isLoading = false;
    }
  }

  populateFormWithCharacterData(characterData: any) {
    this.characterName =
      characterData['dados']?.['basicInfo']?.['nomeDoPersonagem'] || characterData['nome'] || '';

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
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar templates';
    } finally {
      this.isLoading = false;
    }
  }

  selectTemplate(template: Template) {
    this.selectedTemplate = template;
    this.step = 'fill-form';
    this.errorMessage = '';
    this.activeTabIndex = 0;

    this.formData = {};

    template.estrutura.forEach((bloco) => {
      bloco.campos.forEach((campo) => {
        this.formData[campo.name] = '';
      });
    });
  }

  backToTemplateSelection() {
    if (this.isEditMode) {
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

  selectTab(index: number) {
    this.activeTabIndex = index;
    this.errorMessage = '';
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

  validateForm(): boolean {
    if (
      !this.selectedTemplate ||
      this.selectedTemplate.estrutura.length === 0 ||
      this.selectedTemplate.estrutura[0].campos.length === 0
    ) {
      this.errorMessage = '❌ Template inválido';
      return false;
    }

    // Buscar o primeiro campo que NÃO seja imagem
    let firstNameField = this.selectedTemplate.estrutura[0].campos.find(
      (campo) => campo.type !== 'image'
    );

    // Se não encontrou, usar o primeiro campo mesmo
    if (!firstNameField) {
      firstNameField = this.selectedTemplate.estrutura[0].campos[0];
    }

    const firstFieldValue = this.formData[firstNameField.name] || '';

    if (!firstFieldValue.trim()) {
      this.errorMessage = `❌ Por favor, preencha o campo "${firstNameField.label}"`;
      this.activeTabIndex = 0;
      return false;
    }

    this.characterName = firstFieldValue.trim();

    return true;
  }

  async saveCharacter() {
    if (!this.validateForm() || !this.selectedTemplate) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const cleanedFormData: { [key: string]: string } = {};

      Object.keys(this.formData).forEach((key) => {
        const value = this.formData[key];
        if (value !== null && value !== undefined && value !== '') {
          cleanedFormData[key] = String(value).trim();
        }
      });

      if (this.isEditMode && this.characterId) {
        const updateData = {
          nome: this.characterName.trim(),
          templateNome: this.selectedTemplate.nome,
          campos: cleanedFormData,
        };

        await this.firebaseService.updateCharacterSheet(this.characterId, updateData);
        this.successMessage = `✅ ${this.characterName} foi atualizado com sucesso!`;
      } else {
        const sheetData = {
          templateId: this.selectedTemplate.id,
          templateNome: this.selectedTemplate.nome,
          nome: this.characterName.trim(),
          campos: cleanedFormData,
        };

        await this.firebaseService.addCharacterSheet(sheetData);
        this.successMessage = `✅ ${this.characterName} foi criado com sucesso!`;
      }

      this.step = 'success';

      this.redirectTimeout = setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 2000);
    } catch (error: any) {
      if (error.code === 'invalid-argument') {
        this.errorMessage = '❌ Dados inválidos enviados ao servidor. Verifique os campos.';
      } else {
        this.errorMessage = error.message || 'Erro ao salvar o personagem. Tente novamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  createAnother() {
    this.step = 'select-template';
    this.selectedTemplate = null;
    this.characterName = '';
    this.formData = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.activeTabIndex = 0;
  }

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

  // ========================================
  // GERENCIAMENTO DE IMAGENS
  // ========================================

  /**
   * Processa o upload de arquivo de imagem com compressão automática
   */
  handleImageUpload(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      this.errorMessage = '❌ Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF)';
      return;
    }

    // Limpar mensagem de erro
    this.errorMessage = '';

    // Comprimir e converter para Base64
    this.compressImage(file, fieldName);
  }

  /**
   * Comprime a imagem para caber no limite do Firestore (1MB por documento)
   * Target: ~200KB em Base64 para segurança
   */
  private compressImage(file: File, fieldName: string): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 800; // Máximo 800px no lado maior

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          this.errorMessage = '❌ Erro ao processar imagem. Tente novamente.';
          return;
        }

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para Base64 com qualidade ajustada
        // Tentar qualidade 0.7 primeiro (bom equilíbrio qualidade/tamanho)
        let quality = 0.7;
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        // Se ainda muito grande (>300KB em Base64), reduzir qualidade
        const maxBase64Size = 300 * 1024; // 300KB
        while (compressedBase64.length > maxBase64Size && quality > 0.3) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        // Verificar se conseguiu comprimir o suficiente
        if (compressedBase64.length > 500 * 1024) {
          // 500KB limite absoluto
          this.errorMessage =
            '❌ Não foi possível comprimir a imagem o suficiente. Tente uma imagem menor ou mais simples.';
          return;
        }

        // Salvar imagem comprimida
        this.formData[fieldName] = compressedBase64;

        // Mensagem de sucesso
        const originalSizeKB = Math.round(file.size / 1024);
        const compressedSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
        console.log(
          `✅ Imagem comprimida: ${originalSizeKB}KB → ${compressedSizeKB}KB (qualidade: ${Math.round(
            quality * 100
          )}%)`
        );
      };

      img.onerror = () => {
        this.errorMessage = '❌ Erro ao carregar imagem. Tente outro arquivo.';
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      this.errorMessage = '❌ Erro ao ler o arquivo. Tente novamente.';
    };

    reader.readAsDataURL(file);
  }

  /**
   * Atualiza quando o usuário cola uma URL de imagem
   */
  onImageUrlChange(fieldName: string): void {
    // Limpar mensagem de erro quando o usuário digita
    if (this.errorMessage.includes('imagem')) {
      this.errorMessage = '';
    }
  }

  /**
   * Remove a imagem do campo
   */
  removeImage(fieldName: string): void {
    this.formData[fieldName] = '';
  }

  ngOnDestroy() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
}
