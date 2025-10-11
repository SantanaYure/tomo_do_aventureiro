import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  userName: string = '';
  isSidebarCollapsed: boolean = false;

  // Propriedades do Carrossel
  currentSlide: number = 0;
  totalSlides: number = 4;
  slides: number[] = [0, 1, 2, 3]; // Array para *ngFor dos indicadores
  autoPlayInterval: any;
  autoPlayDelay: number = 5000; // 5 segundos

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

    // Iniciar autoplay do carrossel
    this.startAutoPlay();
  }

  ngOnDestroy() {
    // Limpar intervalo ao destruir componente
    this.stopAutoPlay();
  }

  // ========================================
  // MÉTODOS DO CARROSSEL
  // ========================================

  /**
   * Inicia a reprodução automática do carrossel
   */
  startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  /**
   * Para a reprodução automática do carrossel
   */
  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  /**
   * Reinicia o temporizador de autoplay
   */
  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  /**
   * Vai para o próximo slide
   */
  nextSlide(): void {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0; // Volta para o primeiro
    }
  }

  /**
   * Vai para o slide anterior
   */
  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.totalSlides - 1; // Vai para o último
    }
    this.resetAutoPlay();
  }

  /**
   * Vai para um slide específico
   */
  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  // ========================================
  // MÉTODOS DE NAVEGAÇÃO
  // ========================================

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  createCharacter() {
    this.router.navigate(['/create-character']);
  }

  viewCharacters() {
    this.router.navigate(['/my-characters']);
  }
}
