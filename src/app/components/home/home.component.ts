import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  isSidebarCollapsed: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService
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
    } else {
      // Se não houver usuário logado, redirecionar para login
      this.router.navigate(['/login']);
    }

    // Observar mudanças no estado da sidebar
    this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
