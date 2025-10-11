import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { SidebarService } from '../../services/sidebar.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

// Interface atualizada para usar tipos mais estritos para datas.
interface Character {
  id: string;
  nome: string;
  templateNome: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  campos?: any;
  templateId?: string;
  ownerId?: string;
  dados?: any;
}

@Component({
  selector: 'app-my-characters',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  templateUrl: './my-characters.component.html',
  styleUrls: ['./my-characters.component.css'],
})
export class MyCharactersComponent implements OnInit {
  characters: Character[] = [];
  isLoading = true;
  errorMessage = '';
  isSidebarCollapsed = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.loadCharacters();
    this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });
  }

  // Helper para converter Timestamps do Firestore ou strings para Date
  private parseFirestoreDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    if (typeof dateValue.toDate === 'function') {
      // Timestamp do Firestore
      return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
      // String de data (ISO, etc.)
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }
    if (dateValue instanceof Date) {
      // Já é um objeto Date
      return dateValue;
    }
    return null;
  }

  async loadCharacters() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const snapshot = await this.firebaseService.getUserCharacterSheets();

      if (snapshot.empty) {
        this.characters = [];
        this.isLoading = false;
        return;
      }

      // Usando Promise.allSettled para garantir que todos os personagens sejam processados,
      // mesmo que um deles falhe.
      const results = await Promise.allSettled(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let nome = '';

          // 1. PRIORIDADE MÁXIMA: Buscar nos campos específicos do formulário PRIMEIRO
          if (data['campos']) {
            const campos = data['campos'];

            const camposNomePrioritarios = [
              'nome',
              'nomeDoPersonagem',
              'name',
              'characterName',
              'char_name',
            ];

            for (const campoKey of camposNomePrioritarios) {
              if (campos[campoKey]) {
                const valorCampo = campos[campoKey];
                if (typeof valorCampo === 'string' && valorCampo.trim()) {
                  const valorLimpo = valorCampo.trim();
                  // Validar que não é URL de imagem
                  if (
                    !valorLimpo.startsWith('http') &&
                    !valorLimpo.startsWith('data:image') &&
                    !valorLimpo.includes('base64')
                  ) {
                    nome = valorLimpo;
                    break; // Encontrou um nome válido, para a busca
                  }
                }
              }
            }

            // 2. Se ainda não encontrou, pegar o primeiro campo de texto válido (fallback)
            if (!nome) {
              // Lista de palavras-chave para ignorar campos de imagem
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
                // Converte a chave para minúsculas para comparação
                const lowerCaseKey = key.toLowerCase();

                // Pula o campo se a chave corresponder a palavras-chave de imagem
                if (imageFieldKeywords.some((keyword) => lowerCaseKey.includes(keyword))) {
                  continue;
                }

                const value = campos[key];
                if (typeof value === 'string') {
                  const valorLimpo = value.trim();
                  // Verifica se é um texto válido e não muito longo
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

          // 3. APENAS se não encontrou nos campos, tentar no nível raiz (com validação rigorosa)
          if (!nome && typeof data['nome'] === 'string') {
            const nomeRaiz = data['nome'].trim();
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

          // 4. Fallback final para estruturas antigas
          if (!nome) {
            nome = data['dados']?.['basicInfo']?.['nomeDoPersonagem'] || '';
          }

          const finalNome = nome.trim() || 'Personagem Sem Nome';

          let templateNome = data['templateNome'] || 'Template Desconhecido';
          if (!data['templateNome'] && data['templateId']) {
            try {
              const templateDoc = await this.firebaseService.getTemplateById(data['templateId']);
              if (templateDoc.exists()) {
                templateNome = templateDoc.data()['nome'] || 'Template Desconhecido';
              }
            } catch (e) {
              console.error(`Erro ao buscar template ${data['templateId']}:`, e);
            }
          }

          const createdAt = this.parseFirestoreDate(data['createdAt']);
          let updatedAt = this.parseFirestoreDate(data['updatedAt']);

          // Se 'updatedAt' não existir, assume a data de criação
          if (!updatedAt) {
            updatedAt = createdAt;
          }

          // Criar objeto do personagem SEM espalhar ...data para não sobrescrever o nome
          return {
            id: doc.id,
            nome: finalNome, // Nome limpo que extraímos
            templateNome,
            createdAt,
            updatedAt,
            // Incluir campos e outras propriedades necessárias
            campos: data['campos'],
            templateId: data['templateId'],
            ownerId: data['ownerId'],
            dados: data['dados'],
          } as Character;
        })
      );

      // Filtra apenas os resultados que foram resolvidos com sucesso
      this.characters = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<Character>).value);
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Ocorreu um erro ao carregar os personagens. Por favor, tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  createNew() {
    // Força recarga do componente de criação voltando para select-template
    // Mesmo se já estiver na rota /create-character
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/create-character']);
    });
  }

  viewCharacter(id: string) {
    this.router.navigate(['/view-character', id]);
  }

  editCharacter(id: string) {
    this.router.navigate(['/create-character', id]);
  }

  async deleteCharacter(id: string, name: string) {
    // AVISO: window.confirm() pode ser bloqueado e é uma má prática.
    // O ideal é criar um componente de modal customizado para confirmações.
    if (window.confirm(`Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        await this.firebaseService.deleteCharacterSheet(id);
        await this.loadCharacters(); // Recarrega a lista após a exclusão
      } catch (error: any) {
        this.errorMessage = 'Não foi possível excluir o personagem. Tente novamente.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
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
      // Procura pelo elemento de iniciais que é o próximo sibling
      const initialsDiv = imgElement.nextElementSibling as HTMLElement;
      if (initialsDiv && initialsDiv.classList.contains('character-initials')) {
        initialsDiv.style.display = 'flex';
      }
    }
  }
}
