import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { SidebarService } from '../../services/sidebar.service';

// Interface atualizada para usar tipos mais estritos para datas.
// Isso melhora a previsibilidade e ajuda a evitar erros no template.
interface Character {
  id: string;
  nome: string;
  templateNome: string;
  createdAt: Date | null; // Alterado de 'any' para 'Date | null'
  updatedAt: Date | null; // Alterado de 'any' para 'Date | null'
  [key: string]: any;
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

    // Subscrever ao estado da sidebar
    this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });
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

      const charactersPromises = snapshot.docs.map(async (doc) => {
        try {
          const data = doc.data();

          const nome =
            data['dados']?.['basicInfo']?.['nomeDoPersonagem'] ||
            data['nome'] ||
            'Personagem Sem Nome';

          let templateNome = data['templateNome'] || 'Template Desconhecido';

          if (!data['templateNome'] && data['templateId']) {
            try {
              const templateDoc = await this.firebaseService.getTemplateById(data['templateId']);
              if (templateDoc.exists()) {
                templateNome = templateDoc.data()['nome'] || 'Template Desconhecido';
              }
            } catch (e) {}
          }

          let createdAt: Date | null = null;
          let updatedAt: Date | null = null;

          if (data['createdAt']) {
            if (typeof data['createdAt'].toDate === 'function') {
              createdAt = data['createdAt'].toDate();
            } else if (typeof data['createdAt'] === 'string') {
              createdAt = new Date(data['createdAt']);
            } else if (data['createdAt'] instanceof Date) {
              createdAt = data['createdAt'];
            }
          }

          if (data['updatedAt']) {
            if (typeof data['updatedAt'].toDate === 'function') {
              updatedAt = data['updatedAt'].toDate();
            } else if (typeof data['updatedAt'] === 'string') {
              updatedAt = new Date(data['updatedAt']);
            } else if (data['updatedAt'] instanceof Date) {
              updatedAt = data['updatedAt'];
            }
          }

          if (!updatedAt && createdAt) {
            updatedAt = createdAt;
          }

          const character = {
            id: doc.id,
            nome: nome,
            templateNome: templateNome,
            createdAt: createdAt,
            updatedAt: updatedAt,
            ...data,
          } as Character;

          return character;
        } catch (docError: any) {
          throw docError;
        }
      });

      this.characters = await Promise.all(charactersPromises);
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Ocorreu um erro ao carregar os personagens. Por favor, tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  createNew() {
    this.router.navigate(['/create-character']);
  }

  viewCharacter(id: string) {
    this.router.navigate(['/view-character', id]);
  }

  editCharacter(id: string) {
    this.router.navigate(['/create-character', id]);
  }

  async deleteCharacter(id: string, name: string) {
    if (window.confirm(`Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        await this.firebaseService.deleteCharacterSheet(id);
        await this.loadCharacters();
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

  /**
   * Retorna as iniciais do nome para exibir quando não há imagem
   */
  getInitials(name: string): string {
    if (!name) return '?';

    const words = name
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

    // Pega primeira letra do primeiro e último nome
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
}
