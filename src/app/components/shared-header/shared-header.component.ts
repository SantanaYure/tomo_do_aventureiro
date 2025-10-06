import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.css'],
})
export class SharedHeaderComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userPhotoURL: string | null = null;
  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.checkScreenSize();
  }

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
      this.userPhotoURL = currentUser.photoURL || null;
    } else {
      // Se não houver usuário logado, redirecionar para login
      this.router.navigate(['/login']);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    // Fechar menu mobile se estiver aberto
    if (this.isDropdownOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Fechar dropdown se estiver aberto
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  closeAllMenus() {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }
}
