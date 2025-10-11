import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { SidebarService } from '../../services/sidebar.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface TemplateField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  accept?: string;
  options?: string[];
  allowCustom?: boolean;
  conditional?: {
    field: string;
    value: string;
  };
  rows?: number;
  fullWidth?: boolean;
  readonly?: boolean;
  formula?: string;
  skills?: any[];
  formulaModificador?: string;
  min?: number;
  max?: number;
}

interface TemplateBlock {
  bloco: string;
  icone?: string;
  helpText?: string;
  campos: TemplateField[];
}

interface Template {
  nome_template: string;
  descricao: string;
  estrutura: TemplateBlock[];
}

interface Alert {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

@Component({
  selector: 'app-template-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedHeaderComponent],
  templateUrl: './template-creator.component.html',
  styleUrl: './template-creator.component.css',
})
export class TemplateCreatorComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private sidebarService = inject(SidebarService);

  isSidebarCollapsed = false;
  jsonText = '';
  validatedTemplate: Template | null = null;
  previewHtml = this.getInitialPreviewHtml();
  isSaveDisabled = true;
  isSaving = false;
  isFirebaseConnected = false;
  isTutorialOpen = false;
  alerts: Alert[] = [];
  private alertIdCounter = 0;

  exampleTemplates = {
    narrativa: {
      nome_template: 'Personagem de Narrativa (Romance/Conto)',
      descricao:
        'Um modelo completo para desenvolvimento de personagens para romances, contos e outras obras de ficção, focado em profundidade psicológica e arco narrativo.',
      estrutura: [
        {
          bloco: 'Identidade & Aparência',
          campos: [
            {
              name: 'imagem_personagem',
              label: 'Imagem do Personagem',
              type: 'image',
              placeholder: 'URL da imagem ou upload de arquivo',
              helpText: 'Cole uma URL de imagem ou faça upload de um arquivo (JPG, PNG, GIF)',
              accept: 'image/*',
            },
            {
              name: 'nomeCompleto',
              label: 'Nome Completo',
              type: 'text',
              placeholder: 'O nome de batismo do personagem.',
            },
            {
              name: 'apelido',
              label: 'Apelido / Como é Conhecido(a)',
              type: 'text',
              placeholder: 'Como os outros o chamam? Isso diz muito.',
            },
            {
              name: 'idade',
              label: 'Idade',
              type: 'number',
              placeholder: 'Idade cronológica ou aparente.',
            },
            {
              name: 'ocupacao',
              label: 'Ocupação / Profissão',
              type: 'text',
              placeholder: 'O que ele(a) faz para viver?',
            },
            {
              name: 'aparenciaGeral',
              label: 'Aparência Geral',
              type: 'textarea',
              placeholder: 'Descreva o personagem como se estivesse o introduzindo em seu livro.',
            },
            {
              name: 'tracosMarcantes',
              label: 'Traços Marcantes',
              type: 'text',
              placeholder: 'Cicatrizes, tatuagens, um jeito de sorrir, cor dos olhos.',
            },
            {
              name: 'estiloVestir',
              label: 'Estilo de se Vestir',
              type: 'text',
              placeholder: 'O que suas roupas dizem sobre ele(a)?',
            },
          ],
        },
        {
          bloco: 'Psicologia & Essência',
          campos: [
            {
              name: 'resumoUmaFrase',
              label: 'Resumo em Uma Frase (Arquétipo)',
              type: 'textarea',
              placeholder: "Ex: 'Um artista amargurado que busca redenção.'",
            },
            {
              name: 'motivacaoPrincipal',
              label: 'Motivação Principal',
              type: 'textarea',
              placeholder: 'O que ele(a) quer acima de tudo? (Amor, poder, vingança, paz).',
            },
            {
              name: 'maiorMedo',
              label: 'Maior Medo',
              type: 'textarea',
              placeholder: 'O que ele(a) evita a todo custo? (Solidão, fracasso, irrelevância).',
            },
            {
              name: 'qualidadesForcas',
              label: 'Qualidades / Forças Morais',
              type: 'textarea',
              placeholder: 'Leal, corajoso, inteligente, empático, resiliente...',
            },
            {
              name: 'defeitosFraquezas',
              label: 'Defeitos / Fraquezas Morais',
              type: 'textarea',
              placeholder: 'Teimoso, impulsivo, egoísta, medroso, ingênuo...',
            },
            {
              name: 'oGrandeSegredo',
              label: 'O Grande Segredo',
              type: 'textarea',
              placeholder:
                'O que ele(a) esconde de todo mundo? Isso é uma mina de ouro para a trama.',
            },
            {
              name: 'visaoDeMundo',
              label: 'Visão de Mundo / Filosofia de Vida',
              type: 'textarea',
              placeholder: 'É cínico? Otimista? Acredita no destino ou no livre-arbítrio?',
            },
          ],
        },
      ],
    },
    simples: {
      nome_template: 'Personagem Simples',
      descricao:
        'Template minimalista com apenas os campos essenciais para uma criação rápida e direta de personagens.',
      estrutura: [
        {
          bloco: 'Informações do Personagem',
          icone: 'bi-person-circle',
          campos: [
            {
              name: 'imagem_personagem',
              label: 'Imagem do Personagem',
              type: 'image',
              placeholder: 'URL da imagem ou upload de arquivo',
              helpText: 'Cole uma URL de imagem ou faça upload de um arquivo (JPG, PNG, GIF)',
              accept: 'image/*',
            },
            {
              name: 'nome',
              label: 'Nome',
              type: 'text',
              placeholder: 'Digite o nome do personagem...',
              required: true,
            },
            {
              name: 'idade',
              label: 'Idade',
              type: 'number',
              placeholder: 'Ex: 25',
              min: 0,
              max: 999,
            },
            {
              name: 'sexo',
              label: 'Sexo',
              type: 'select',
              options: ['Masculino', 'Feminino', 'Outro'],
              placeholder: 'Selecione...',
            },
            {
              name: 'funcao_personagem',
              label: 'Função do Personagem',
              type: 'text',
              placeholder: 'Ex: Protagonista, Vilão, Coadjuvante...',
            },
            {
              name: 'descricao_fisica',
              label: 'Descrição Física',
              type: 'textarea',
              placeholder: 'Descreva a aparência do personagem...',
              rows: 4,
            },
            {
              name: 'tracos_personalidade',
              label: 'Traços de Personalidade',
              type: 'textarea',
              placeholder: 'Descreva a personalidade do personagem...',
              rows: 4,
            },
          ],
        },
      ],
    },
  };

  ngOnInit() {
    this.checkFirebaseConnection();
    this.subscribeToSidebar();
  }

  subscribeToSidebar() {
    this.sidebarService.collapsed$.subscribe((collapsed: boolean) => {
      this.isSidebarCollapsed = collapsed;
    });
  }

  checkFirebaseConnection() {
    const unsubscribe = this.firebaseService.onAuthStateChanged((user) => {
      if (user) {
        this.isFirebaseConnected = true;
        this.showAlert('Firebase conectado com sucesso!', 'success');
      } else {
        this.isFirebaseConnected = false;
      }
    });
  }

  validateJson() {
    try {
      const trimmed = this.jsonText.trim();
      if (!trimmed) {
        throw new Error('O editor está vazio. Cole um JSON válido.');
      }

      const parsed = JSON.parse(trimmed) as Template;

      if (!parsed.nome_template || !parsed.estrutura) {
        throw new Error('JSON inválido. Faltando "nome_template" ou "estrutura".');
      }

      this.validatedTemplate = parsed;
      this.generatePreview(parsed);
      this.isSaveDisabled = false;
      this.showAlert('✓ Template validado com sucesso!', 'success');
    } catch (error: any) {
      this.validatedTemplate = null;
      this.isSaveDisabled = true;
      this.previewHtml = `
        <div class="text-center py-8 text-red-400">
          <i class="bi bi-exclamation-triangle text-4xl mb-2"></i><br>
          <strong>Erro de validação:</strong><br>${error.message}
        </div>
      `;
      this.showAlert(error.message, 'error');
    }
  }

  async saveTemplate() {
    if (!this.validatedTemplate || !this.isFirebaseConnected) {
      this.showAlert('Valide o template ou aguarde a autenticação antes de salvar!', 'warning');
      return;
    }

    this.isSaving = true;
    this.isSaveDisabled = true;

    try {
      const db = this.firebaseService.getFirestore();
      const docData = {
        nome: this.validatedTemplate.nome_template,
        descricao: this.validatedTemplate.descricao || '',
        estrutura: this.validatedTemplate.estrutura || [],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'templates'), docData);

      this.showAlert(
        `✓ Template "${this.validatedTemplate.nome_template}" salvo com sucesso!`,
        'success'
      );
      this.clearEditor();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const errorMessage =
        error.code === 'permission-denied'
          ? 'Erro de permissão! Verifique as regras do Firestore.'
          : error.message;
      this.showAlert(`Erro ao salvar no Firebase: ${errorMessage}`, 'error');
    } finally {
      this.isSaving = false;
      this.isSaveDisabled = true;
    }
  }

  clearEditor() {
    if (confirm('Deseja limpar o editor?')) {
      this.jsonText = '';
      this.validatedTemplate = null;
      this.isSaveDisabled = true;
      this.previewHtml = this.getInitialPreviewHtml();
    }
  }

  loadExample(templateKey: 'narrativa' | 'simples') {
    const template = this.exampleTemplates[templateKey];
    this.jsonText = JSON.stringify(template, null, 2);
    this.showAlert('Exemplo carregado! Clique em "Validar JSON" para visualizar.', 'info');
    this.validatedTemplate = null;
    this.isSaveDisabled = true;
  }

  generatePreview(template: Template) {
    let html = `
      <div class="space-y-4">
        <div class="preview-header">
          <h3 class="text-xl font-bold text-white mb-1">${template.nome_template}</h3>
          <p class="text-sm text-gray-400">${template.descricao}</p>
        </div>
    `;

    template.estrutura.forEach((bloco) => {
      const iconeHtml = bloco.icone ? `<i class="bi ${bloco.icone}"></i>` : '';
      const helpTextHtml = bloco.helpText
        ? `<p class="text-xs text-gray-500 italic mt-1">${bloco.helpText}</p>`
        : '';

      html += `
        <div class="preview-block">
          <h4 class="font-bold text-white mb-2 flex items-center gap-2">
            ${iconeHtml}${bloco.bloco}
          </h4>
          ${helpTextHtml}
          <div class="space-y-2 mt-3">
      `;

      bloco.campos.forEach((campo) => {
        const requiredBadge = campo.required
          ? '<span class="text-red-400 text-xs ml-1">*</span>'
          : '';
        const helpTextCampo = campo.helpText
          ? `<br><span class="text-xs text-gray-500 italic ml-6">ℹ ${campo.helpText}</span>`
          : '';

        let extraInfo = '';
        let conditionalInfo = '';

        if (campo.type === 'image') {
          extraInfo =
            ' <span class="text-xs text-pink-400">→ 🖼️ Upload de imagem (URL ou arquivo)</span>';
        }

        if (campo.conditional) {
          conditionalInfo = ` <span class="text-xs text-orange-400">→ 🔀 Aparece somente se "${campo.conditional.field}" = "${campo.conditional.value}"</span>`;
        }

        if (campo.type === 'select' && campo.options) {
          extraInfo = ` <span class="text-xs text-yellow-400">→ ${campo.options.length} opções</span>`;
          if (campo.allowCustom) {
            extraInfo += ' <span class="text-xs text-blue-400">+ campo customizado</span>';
          }
        }

        if (campo.type === 'textarea' && campo.rows) {
          extraInfo = ` <span class="text-xs text-purple-400">→ ${campo.rows} linhas</span>`;
          if (campo.fullWidth) {
            extraInfo += ' <span class="text-xs text-pink-400">📄 Largura total</span>';
          }
        }

        html += `
          <div class="preview-field">
            <span class="text-primary-lightest font-medium">${campo.label}${requiredBadge}</span>
            <span class="text-gray-500 ml-2">(${campo.type})</span>
            ${extraInfo}
            ${conditionalInfo}
            ${helpTextCampo}
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += '</div>';
    this.previewHtml = html;
  }

  getInitialPreviewHtml(): string {
    return `
      <div class="text-gray-400 text-center py-8">
        <i class="bi bi-info-circle text-4xl mb-2"></i><br>
        Cole um JSON no editor e clique em "Validar" para ver o preview.
      </div>
    `;
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const alert: Alert = {
      message,
      type,
      id: this.alertIdCounter++,
    };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert.id);
    }, 6000);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
  }

  openTutorial() {
    this.isTutorialOpen = true;
  }

  closeTutorial() {
    this.isTutorialOpen = false;
  }
}
