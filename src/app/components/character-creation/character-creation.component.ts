import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BasicInfoComponent } from '../basic-info/basic-info.component';
import { AttributesComponent } from '../attributes/attributes.component';

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [CommonModule, BasicInfoComponent, AttributesComponent],
  templateUrl: './character-creation.component.html',
  styleUrl: './character-creation.component.css',
})
export class CharacterCreationComponent implements OnInit {
  currentUser: User | null = null;
  sidebarClosed = false;
  activeTab = 'info-pane';

  // Lista de tabs/seções do painel
  tabs = [
    {
      id: 'info-pane',
      title: 'Informações Básicas',
      icon: 'bi-person-circle',
      description:
        'Aqui ficarão os detalhes como nome do personagem, classe, nível, raça, antecedente e alinhamento.',
      content:
        'Esta seção também pode incluir experiência, inspiração e outras informações fundamentais do personagem.',
    },
    {
      id: 'attributes-pane',
      title: 'Atributos',
      icon: 'bi-graph-up',
      description: 'Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma.',
      content: 'Visualize os valores dos atributos, modificadores e salvaguardas relacionadas.',
    },
    {
      id: 'combat-pane',
      title: 'Combate',
      icon: 'bi-shield-fill',
      description:
        'Detalhes de Classe de Armadura, Pontos de Vida, Dados de Vida, Iniciativa e Deslocamento.',
      content: 'Acompanhe também sucessos e falhas em testes de morte durante combate.',
    },
    {
      id: 'skills-pane',
      title: 'Competências',
      icon: 'bi-star-fill',
      description: 'Bônus de proficiência, perícias, salvaguardas e outras proficiências.',
      content: 'Marque suas proficiências em perícias, ferramentas, idiomas e armas.',
    },
    {
      id: 'attacks-pane',
      title: 'Ataques e Magia',
      icon: 'bi-lightning-fill',
      description: 'Lista de ataques com armas e magias de ataque.',
      content: 'Registre nome da arma/magia, bônus de ataque e dano causado.',
    },
    {
      id: 'equipment-pane',
      title: 'Equipamento',
      icon: 'bi-backpack-fill',
      description: 'Inventário completo, moedas (PO, PP, PE, PC, PL) e itens mágicos.',
      content: 'Gerencie a carga do personagem e organize seus pertences.',
    },
    {
      id: 'abilities-pane',
      title: 'Habilidades',
      icon: 'bi-gem',
      description: 'Traços de espécie, características de classe e talentos adquiridos.',
      content: 'Liste todas as habilidades especiais que seu personagem possui.',
    },
    {
      id: 'spells-pane',
      title: 'Conjuração',
      icon: 'bi-moon-stars-fill',
      description: 'Atributo de conjuração, CD de resistência, bônus de ataque e espaços de magia.',
      content: 'Organize suas magias conhecidas e preparadas por nível.',
    },
    {
      id: 'personality-pane',
      title: 'Personalidade',
      icon: 'bi-heart-fill',
      description: 'Aparência física, traços de personalidade, ideais, vínculos e defeitos.',
      content: 'Desenvolva a história de fundo e características únicas do seu personagem.',
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Detectar tamanho da tela e configurar sidebar inicialmente
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    // Em telas menores que 768px, sidebar começa fechada
    if (window.innerWidth <= 768) {
      this.sidebarClosed = true;
    } else {
      // Em telas maiores, sidebar começa aberta
      this.sidebarClosed = false;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
  }

  closeSidebar() {
    this.sidebarClosed = true;
  }

  openSidebar() {
    this.sidebarClosed = false;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  getActiveTabData() {
    return this.tabs.find((tab) => tab.id === this.activeTab);
  }
}
