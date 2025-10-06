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
      console.log('🔍 Iniciando carregamento de personagens...');
      const snapshot = await this.firebaseService.getUserCharacterSheets();
      console.log('📦 Snapshot recebido:', snapshot.size, 'documentos');

      if (snapshot.empty) {
        console.log('📭 Nenhum personagem encontrado');
        this.characters = [];
        this.isLoading = false;
        return;
      }

      const charactersPromises = snapshot.docs.map(async (doc) => {
        try {
          const data = doc.data();
          console.log('📄 Processando documento:', doc.id, data);

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
              console.warn(
                `⚠️ Não foi possível carregar o nome do template para a ficha ${doc.id}`,
                e
              );
            }
          }

          // Conversão de datas - suporta tanto Timestamp quanto string ISO
          let createdAt: Date | null = null;
          let updatedAt: Date | null = null;

          // Tentar converter createdAt
          if (data['createdAt']) {
            if (typeof data['createdAt'].toDate === 'function') {
              // É um Timestamp do Firestore
              createdAt = data['createdAt'].toDate();
            } else if (typeof data['createdAt'] === 'string') {
              // É uma string ISO
              createdAt = new Date(data['createdAt']);
            } else if (data['createdAt'] instanceof Date) {
              // Já é um Date
              createdAt = data['createdAt'];
            }
          }

          // Tentar converter updatedAt
          if (data['updatedAt']) {
            if (typeof data['updatedAt'].toDate === 'function') {
              // É um Timestamp do Firestore
              updatedAt = data['updatedAt'].toDate();
            } else if (typeof data['updatedAt'] === 'string') {
              // É uma string ISO
              updatedAt = new Date(data['updatedAt']);
            } else if (data['updatedAt'] instanceof Date) {
              // Já é um Date
              updatedAt = data['updatedAt'];
            }
          }

          // Se não houver updatedAt, usar createdAt
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

          console.log('✅ Personagem processado:', character.nome);
          return character;
        } catch (docError: any) {
          console.error('❌ Erro ao processar documento:', doc.id, docError);
          throw docError;
        }
      });

      this.characters = await Promise.all(charactersPromises);
      console.log('✅ Total de personagens carregados:', this.characters.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar personagens:', error);
      console.error('Stack trace:', error.stack);
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
