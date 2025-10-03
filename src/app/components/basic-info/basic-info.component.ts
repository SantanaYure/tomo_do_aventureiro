import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClasseNivel {
  classe: string;
  subclasse: string;
  nivel: number;
}

interface BasicInfo {
  nomeDoPersonagem: string;
  classe: string; // Mantido para compatibilidade
  subclasse: string; // Mantido para compatibilidade
  nivel: number; // Nível total (soma de todas as classes)
  classes: ClasseNivel[]; // Array de classes para multiclasse
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
    classes: [{ classe: '', subclasse: '', nivel: 1 }],
    especie: '',
    antecedente: '',
    xp: 0,
    alinhamento: '',
    tamanho: '',
  };

  isEditMode: boolean = true;
  mostrarMulticlasse: boolean = false;

  ngOnInit() {
    this.loadInfo();
  }

  /**
   * Adiciona uma nova classe ao array de multiclasse
   */
  adicionarClasse() {
    if (this.basicInfo.classes.length < 4) {
      // Limite de 4 classes
      this.basicInfo.classes.push({ classe: '', subclasse: '', nivel: 1 });
    }
  }

  /**
   * Remove uma classe do array de multiclasse
   */
  removerClasse(index: number) {
    if (this.basicInfo.classes.length > 1) {
      this.basicInfo.classes.splice(index, 1);
      this.calcularNivelTotal();
    }
  }

  /**
   * Calcula o nível total somando todas as classes
   */
  calcularNivelTotal() {
    this.basicInfo.nivel = this.basicInfo.classes.reduce((total, c) => total + (c.nivel || 0), 0);

    // Atualizar classe e subclasse principal (primeira do array)
    if (this.basicInfo.classes.length > 0) {
      this.basicInfo.classe = this.basicInfo.classes
        .map((c) => c.classe)
        .filter((c) => c)
        .join(' / ');
      this.basicInfo.subclasse = this.basicInfo.classes
        .map((c) => c.subclasse)
        .filter((c) => c)
        .join(' / ');
    }
  }

  /**
   * Alterna visibilidade do painel de multiclasse
   */
  toggleMulticlasse() {
    this.mostrarMulticlasse = !this.mostrarMulticlasse;
  }

  saveInfo() {
    // Calcular nível total antes de salvar
    this.calcularNivelTotal();

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
        classes: [{ classe: '', subclasse: '', nivel: 1 }],
        especie: '',
        antecedente: '',
        xp: 0,
        alinhamento: '',
        tamanho: '',
      };
      localStorage.removeItem('basicInfo');
      this.isEditMode = true;
      this.mostrarMulticlasse = false;
    }
  }

  loadInfo() {
    const saved = localStorage.getItem('basicInfo');
    if (saved) {
      this.basicInfo = JSON.parse(saved);

      // Garantir que o array de classes existe (compatibilidade com dados antigos)
      if (!this.basicInfo.classes || this.basicInfo.classes.length === 0) {
        this.basicInfo.classes = [
          {
            classe: this.basicInfo.classe || '',
            subclasse: this.basicInfo.subclasse || '',
            nivel: this.basicInfo.nivel || 1,
          },
        ];
      }

      // Mostrar multiclasse se houver mais de uma classe
      if (this.basicInfo.classes.length > 1) {
        this.mostrarMulticlasse = true;
      }

      this.isEditMode = false;
    }
  }
}
