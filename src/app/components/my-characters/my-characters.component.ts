import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe importado aqui
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

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
  imports: [CommonModule, DatePipe, SharedHeaderComponent], // DatePipe precisa estar nos imports para o pipe 'date' funcionar
  templateUrl: './my-characters.component.html',
  styleUrls: ['./my-characters.component.css'],
})
export class MyCharactersComponent implements OnInit {
  characters: Character[] = [];
  isLoading = true;
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
        this.characters = [];
        this.isLoading = false;
        return;
      }

      const charactersPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const nome =
          data['dados']?.['basicInfo']?.['nomeDoPersonagem'] ||
          data['nome'] ||
          'Personagem Sem Nome';

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

        // Conversão direta de Timestamp para Date ou null.
        // Isso garante que o objeto 'character' sempre terá o tipo correto.
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
    } catch (error: any) {
      console.error('❌ Erro ao carregar personagens:', error);
      this.errorMessage = 'Ocorreu um erro desconhecido ao carregar os personagens.';
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
        await this.loadCharacters(); // Recarrega a lista
      } catch (error: any) {
        console.error('❌ Erro ao excluir:', error);
        this.errorMessage = 'Não foi possível excluir o personagem. Tente novamente.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  // O método formatDate foi removido, pois a conversão agora é feita
  // diretamente em loadCharacters, simplificando o código e garantindo
  // que a propriedade no objeto 'character' já seja do tipo Date.
}
