import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreImportService } from '../../services/firestore-import.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  isImporting: boolean = false;
  importMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestoreImportService: FirestoreImportService
  ) {}

  ngOnInit() {
    // Carregar informações do usuário
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName =
        currentUser.nickname ||
        currentUser.nome ||
        currentUser.email?.split('@')[0] ||
        'Aventureiro';
      this.userEmail = currentUser.email || '';
    } else {
      // Se não houver usuário logado, redirecionar para login
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método temporário para importar o template
  async importNarrativeTemplate() {
    this.isImporting = true;
    this.importMessage = '';

    try {
      await this.firestoreImportService.importNarrativeCharacterTemplate();
      this.importMessage = '✅ Template importado com sucesso! Verifique o console e o Firestore.';
      console.log('Acesse o Firestore Console: https://console.firebase.google.com/');
    } catch (error: any) {
      this.importMessage = `❌ Erro ao importar: ${error.message}`;
      console.error('Erro detalhado:', error);
    } finally {
      this.isImporting = false;
    }
  }
}
