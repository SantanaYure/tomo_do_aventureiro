import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BasicInfo {
  nomeDoPersonagem: string;
  classe: string;
  subclasse: string;
  nivel: number;
  especie: string;
  antecedente: string;
  xp: number;
  alinhamento: string;
  tamanho: string;
}

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.css',
})
export class BasicInfoComponent implements OnInit {
  basicInfo: BasicInfo = {
    nomeDoPersonagem: '',
    classe: '',
    subclasse: '',
    nivel: 1,
    especie: '',
    antecedente: '',
    xp: 0,
    alinhamento: '',
    tamanho: '',
  };

  isEditMode: boolean = true; // Por padrão, inicia em modo de edição

  ngOnInit() {
    // Carregar dados salvos se existirem
    this.loadInfo();
  }

  saveInfo() {
    // Salvar no localStorage
    localStorage.setItem('basicInfo', JSON.stringify(this.basicInfo));
    console.log('Informações básicas salvas:', this.basicInfo);

    // Desabilitar modo de edição após salvar
    this.isEditMode = false;

    // Feedback visual
    alert('Informações salvas com sucesso!');
  }

  editInfo() {
    // Habilitar modo de edição
    this.isEditMode = true;
    console.log('Modo de edição ativado');
  }

  resetInfo() {
    if (confirm('Tem certeza que deseja limpar todas as informações?')) {
      this.basicInfo = {
        nomeDoPersonagem: '',
        classe: '',
        subclasse: '',
        nivel: 1,
        especie: '',
        antecedente: '',
        xp: 0,
        alinhamento: '',
        tamanho: '',
      };
      localStorage.removeItem('basicInfo');
      this.isEditMode = true; // Volta para modo de edição
    }
  }

  loadInfo() {
    const saved = localStorage.getItem('basicInfo');
    if (saved) {
      this.basicInfo = JSON.parse(saved);
      this.isEditMode = false; // Se tem dados salvos, inicia em modo visualização
    }
  }
}
