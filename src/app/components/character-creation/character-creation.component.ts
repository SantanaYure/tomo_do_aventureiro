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

  // Image Crop Modal
  showImageCropModal = false;
  currentCropFieldName = '';
  cropImageSrc = '';
  cropCanvas: HTMLCanvasElement | null = null;
  cropContext: CanvasRenderingContext2D | null = null;
  cropImage: HTMLImageElement | null = null;
  cropScale = 1;
  cropX = 0;
  cropY = 0;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
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
   * Processa o upload de arquivo de imagem abrindo modal de crop
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

    // Abrir modal de crop
    this.openImageCropModal(file, fieldName);
  }

  /**
   * Abre modal de crop de imagem
   */
  private openImageCropModal(file: File, fieldName: string): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.cropImageSrc = e.target.result as string;
        this.currentCropFieldName = fieldName;
        this.showImageCropModal = true;

        // Aguardar DOM atualizar antes de inicializar canvas
        setTimeout(() => this.initializeCropCanvas(), 100);
      }
    };

    reader.onerror = () => {
      this.errorMessage = '❌ Erro ao ler o arquivo. Tente novamente.';
    };

    reader.readAsDataURL(file);
  }

  /**
   * Inicializa o canvas de crop
   */
  private initializeCropCanvas(): void {
    this.cropCanvas = document.getElementById('cropCanvas') as HTMLCanvasElement;
    if (!this.cropCanvas) return;

    this.cropContext = this.cropCanvas.getContext('2d');
    if (!this.cropContext) return;

    this.cropImage = new Image();
    this.cropImage.onload = () => {
      if (!this.cropCanvas || !this.cropImage) return;

      // Definir tamanho do canvas (área de preview)
      this.cropCanvas.width = 500;
      this.cropCanvas.height = 500;

      // Calcular escala inicial ideal para a imagem caber no círculo de crop (300px de diâmetro)
      const targetSize = 320; // Um pouco maior que o círculo (300px) para margem
      const maxDimension = Math.max(this.cropImage.width, this.cropImage.height);
      const initialScale = targetSize / maxDimension;

      // Aplicar escala inicial (garantir que nunca seja maior que 1 para imagens grandes)
      this.cropScale = Math.min(initialScale, 1);

      // Centralizar imagem
      this.cropX = 0;
      this.cropY = 0;

      // Desenhar imagem inicial
      this.drawCropCanvas();
    };
    this.cropImage.src = this.cropImageSrc;
  }

  /**
   * Desenha a imagem no canvas com transformações aplicadas
   */
  private drawCropCanvas(): void {
    if (!this.cropCanvas || !this.cropContext || !this.cropImage) return;

    const ctx = this.cropContext;
    const canvas = this.cropCanvas;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações
    ctx.save();
    ctx.translate(this.cropX, this.cropY);
    ctx.scale(this.cropScale, this.cropScale);

    // Centralizar imagem
    const x = (canvas.width / this.cropScale - this.cropImage.width) / 2;
    const y = (canvas.height / this.cropScale - this.cropImage.height) / 2;

    ctx.drawImage(this.cropImage, x, y);
    ctx.restore();

    // Desenhar área de recorte (círculo)
    ctx.strokeStyle = '#a18db5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Aumenta o zoom da imagem (incremento de 2%)
   */
  zoomIn(): void {
    this.cropScale = Math.min(this.cropScale + 0.02, 5);
    this.drawCropCanvas();
  }

  /**
   * Diminui o zoom da imagem (decremento de 2%)
   */
  zoomOut(): void {
    this.cropScale = Math.max(this.cropScale - 0.02, 0.1);
    this.drawCropCanvas();
  }

  /**
   * Inicia o arrasto da imagem
   */
  onCropMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.cropX;
    this.dragStartY = event.clientY - this.cropY;
  }

  /**
   * Move a imagem durante o arrasto
   */
  onCropMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.cropX = event.clientX - this.dragStartX;
    this.cropY = event.clientY - this.dragStartY;
    this.drawCropCanvas();
  }

  /**
   * Finaliza o arrasto da imagem
   */
  onCropMouseUp(): void {
    this.isDragging = false;
  }

  /**
   * Cancela o crop e fecha o modal
   */
  cancelCrop(): void {
    this.showImageCropModal = false;
    this.cropImageSrc = '';
    this.currentCropFieldName = '';
    this.cropCanvas = null;
    this.cropContext = null;
    this.cropImage = null;
  }

  /**
   * Confirma o crop e salva a imagem
   */
  confirmCrop(): void {
    if (!this.cropCanvas || !this.cropContext || !this.cropImage) return;

    // Criar canvas temporário para desenhar imagem SEM o círculo guia
    const tempSourceCanvas = document.createElement('canvas');
    tempSourceCanvas.width = this.cropCanvas.width;
    tempSourceCanvas.height = this.cropCanvas.height;
    const tempSourceCtx = tempSourceCanvas.getContext('2d');

    if (!tempSourceCtx) return;

    // Desenhar APENAS a imagem com transformações (sem o círculo guia)
    tempSourceCtx.save();
    tempSourceCtx.translate(this.cropX, this.cropY);
    tempSourceCtx.scale(this.cropScale, this.cropScale);

    const x = (this.cropCanvas.width / this.cropScale - this.cropImage.width) / 2;
    const y = (this.cropCanvas.height / this.cropScale - this.cropImage.height) / 2;

    tempSourceCtx.drawImage(this.cropImage, x, y);
    tempSourceCtx.restore();

    // Criar canvas final para extrair área circular
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 300;
    finalCanvas.height = 300;
    const finalCtx = finalCanvas.getContext('2d');

    if (!finalCtx) return;

    // Criar máscara circular no canvas final
    finalCtx.beginPath();
    finalCtx.arc(150, 150, 150, 0, Math.PI * 2);
    finalCtx.closePath();
    finalCtx.clip();

    // Copiar área recortada do canvas limpo (sem círculo guia)
    const centerX = tempSourceCanvas.width / 2;
    const centerY = tempSourceCanvas.height / 2;
    const radius = 150;

    finalCtx.drawImage(
      tempSourceCanvas,
      centerX - radius,
      centerY - radius,
      radius * 2,
      radius * 2,
      0,
      0,
      300,
      300
    );

    // Comprimir e salvar
    this.compressAndSaveImage(finalCanvas, this.currentCropFieldName);

    // Fechar modal
    this.cancelCrop();
  }

  /**
   * Comprime a imagem do canvas e salva no formData
   */
  private compressAndSaveImage(canvas: HTMLCanvasElement, fieldName: string): void {
    let quality = 0.7;
    let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

    // Se ainda muito grande (>300KB em Base64), reduzir qualidade
    const maxBase64Size = 300 * 1024;
    while (compressedBase64.length > maxBase64Size && quality > 0.3) {
      quality -= 0.1;
      compressedBase64 = canvas.toDataURL('image/jpeg', quality);
    }

    // Verificar se conseguiu comprimir o suficiente
    if (compressedBase64.length > 500 * 1024) {
      this.errorMessage =
        '❌ Não foi possível comprimir a imagem o suficiente. Tente uma imagem menor ou mais simples.';
      return;
    }

    // Salvar imagem comprimida
    this.formData[fieldName] = compressedBase64;

    // Mensagem de sucesso (imagem comprimida)
    const compressedSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
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
