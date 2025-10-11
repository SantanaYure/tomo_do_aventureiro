import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { DateUtils } from '../../utils/date.utils';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { SidebarService } from '../../services/sidebar.service';

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

  isSidebarCollapsed = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
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
        if (this.characterId) {
          await this.loadCharacter(this.characterId);
        }
      } else {
        this.errorMessage = 'ID do personagem não fornecido';
        this.isLoading = false;
      }
    });
  }

  async loadCharacter(characterId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const characterDoc = await this.firebaseService.getCharacterSheetById(characterId);

      if (!characterDoc.exists()) {
        throw new Error('Personagem não encontrado');
      }

      const characterData = characterDoc.data();

      let createdAt: Date | null = null;
      let updatedAt: Date | null = null;

      if (characterData['createdAt']) {
        if (typeof characterData['createdAt'].toDate === 'function') {
          createdAt = characterData['createdAt'].toDate();
        } else if (typeof characterData['createdAt'] === 'string') {
          createdAt = new Date(characterData['createdAt']);
        } else if (characterData['createdAt'] instanceof Date) {
          createdAt = characterData['createdAt'];
        }
      }

      if (characterData['updatedAt']) {
        if (typeof characterData['updatedAt'].toDate === 'function') {
          updatedAt = characterData['updatedAt'].toDate();
        } else if (typeof characterData['updatedAt'] === 'string') {
          updatedAt = new Date(characterData['updatedAt']);
        } else if (characterData['updatedAt'] instanceof Date) {
          updatedAt = characterData['updatedAt'];
        }
      }

      if (!updatedAt && createdAt) {
        updatedAt = createdAt;
      }

      // Extrair nome do personagem com a mesma lógica do my-characters
      let nome = '';

      // 1. PRIORIDADE: Buscar nos campos específicos do formulário
      if (characterData['campos']) {
        const campos = characterData['campos'];
        const camposNomePrioritarios = [
          'nome',
          'nomeDoPersonagem',
          'name',
          'characterName',
          'char_name',
        ];

        for (const campoKey of camposNomePrioritarios) {
          const valorCampo = campos[campoKey];
          if (typeof valorCampo === 'string' && valorCampo.trim()) {
            const valorLimpo = valorCampo.trim();
            if (
              !valorLimpo.startsWith('http') &&
              !valorLimpo.startsWith('data:image') &&
              !valorLimpo.includes('base64')
            ) {
              nome = valorLimpo;
              break;
            }
          }
        }

        // 2. Fallback: primeiro campo de texto válido
        if (!nome) {
          const imageFieldKeywords = [
            'imagem',
            'foto',
            'image',
            'picture',
            'avatar',
            'logo',
            'icon',
            'base64',
          ];

          for (const key in campos) {
            const lowerCaseKey = key.toLowerCase();
            if (imageFieldKeywords.some((keyword) => lowerCaseKey.includes(keyword))) {
              continue;
            }

            const value = campos[key];
            if (typeof value === 'string') {
              const valorLimpo = value.trim();
              if (
                valorLimpo &&
                valorLimpo.length < 100 &&
                !valorLimpo.startsWith('http') &&
                !valorLimpo.startsWith('data:image') &&
                !valorLimpo.includes('base64')
              ) {
                nome = valorLimpo;
                break;
              }
            }
          }
        }
      }

      // 3. Tentar nível raiz apenas se não encontrou (com validação rigorosa)
      if (!nome && typeof characterData['nome'] === 'string') {
        const nomeRaiz = characterData['nome'].trim();
        if (
          nomeRaiz &&
          !nomeRaiz.startsWith('http') &&
          !nomeRaiz.startsWith('data:image') &&
          !nomeRaiz.includes('base64') &&
          nomeRaiz.length < 100
        ) {
          nome = nomeRaiz;
        }
      }

      // 4. Fallback estruturas antigas
      if (!nome) {
        nome = characterData['dados']?.['basicInfo']?.['nomeDoPersonagem'] || '';
      }

      const finalNome = nome.trim() || 'Personagem Sem Nome';

      this.character = {
        id: characterDoc.id,
        nome: finalNome, // Nome extraído corretamente
        templateId: characterData['templateId'],
        templateNome: characterData['templateNome'] || 'Template Desconhecido',
        campos: characterData['dados'] || characterData['campos'] || {},
        createdAt: createdAt,
        updatedAt: updatedAt,
      };

      if (this.character.templateId) {
        await this.loadTemplate(this.character.templateId);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar personagem';
      setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 3000);
    } finally {
      this.isLoading = false;
    }
  }

  async loadTemplate(templateId: string) {
    try {
      const templateDoc = await this.firebaseService.getTemplateById(templateId);

      if (!templateDoc.exists()) {
        return;
      }

      const templateData = templateDoc.data();
      this.template = {
        id: templateDoc.id,
        nome: templateData['nome'],
        descricao: templateData['descricao'],
        estrutura: templateData['estrutura'],
      };
    } catch (error: any) {}
  }

  getFieldValue(fieldName: string): string {
    if (!this.character || !this.character.campos) {
      return '-';
    }

    if (this.character.campos['basicInfo']) {
      const value = this.character.campos['basicInfo'][fieldName];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    const value = this.character.campos[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }

    return '-';
  }

  isImageField(fieldName: string): boolean {
    const imageFieldKeywords = ['imagem', 'foto', 'image', 'picture', 'avatar', 'logo', 'icon'];

    const lowerFieldName = fieldName.toLowerCase();
    return imageFieldKeywords.some((keyword) => lowerFieldName.includes(keyword));
  }

  isNameField(fieldName: string): boolean {
    const nameFieldKeywords = [
      'nome',
      'name',
      'nomedopersonagem',
      'nomepersonagem',
      'charactername',
      'char_name',
    ];

    const lowerFieldName = fieldName.toLowerCase();
    return nameFieldKeywords.some((keyword) => lowerFieldName === keyword);
  }

  hasValue(fieldName: string): boolean {
    const value = this.getFieldValue(fieldName);
    return value !== '-' && value !== '' && value !== null && value !== undefined;
  }

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
          this.router.navigate(['/my-characters']);
        })
        .catch((error) => {
          this.errorMessage = 'Erro ao excluir personagem. Tente novamente.';
          this.isLoading = false;
        });
    }
  }

  formatDate(date: Date | null): string {
    return DateUtils.formatToBrazilian(date);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.parentElement) {
      imgElement.style.display = 'none';
      const initialsDiv = imgElement.nextElementSibling as HTMLElement;
      if (initialsDiv && initialsDiv.classList.contains('portrait-initials')) {
        initialsDiv.style.display = 'flex';
      }
    }
  }
}
