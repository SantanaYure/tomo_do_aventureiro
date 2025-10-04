import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Competencias {
  bonusDeProficiencia: number;
  percepcaoPassiva: number;
  inspiracaoHeroica: boolean;
  salvaguardas: {
    [key: string]: { valor: number; proficiente: boolean };
  };
  pericias: {
    [key: string]: { valor: number; proficiente: boolean; atributo: string };
  };
  proficiencias: {
    armaduras: string[];
    armas: string[];
    ferramentas: string[];
    idiomas: string[];
  };
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
})
export class SkillsComponent implements OnInit {
  isEditMode = false;

  // Atributos padrão para referência
  atributos = ['FORÇA', 'DESTREZA', 'CONSTITUIÇÃO', 'INTELIGÊNCIA', 'SABEDORIA', 'CARISMA'];

  // Lista de perícias com seus atributos correspondentes
  periciasList = [
    { nome: 'Atletismo', atributo: 'FOR' },
    { nome: 'Acrobacia', atributo: 'DES' },
    { nome: 'Furtividade', atributo: 'DES' },
    { nome: 'Prestidigitação', atributo: 'DES' },
    { nome: 'Arcanismo', atributo: 'INT' },
    { nome: 'História', atributo: 'INT' },
    { nome: 'Investigação', atributo: 'INT' },
    { nome: 'Natureza', atributo: 'INT' },
    { nome: 'Religião', atributo: 'INT' },
    { nome: 'Lidar com Animais', atributo: 'SAB' },
    { nome: 'Intuição', atributo: 'SAB' },
    { nome: 'Medicina', atributo: 'SAB' },
    { nome: 'Percepção', atributo: 'SAB' },
    { nome: 'Sobrevivência', atributo: 'SAB' },
    { nome: 'Atuação', atributo: 'CAR' },
    { nome: 'Enganação', atributo: 'CAR' },
    { nome: 'Intimidação', atributo: 'CAR' },
    { nome: 'Persuasão', atributo: 'CAR' },
  ];

  // Opções de proficiências
  armadurasOpcoes = ['Leve', 'Média', 'Pesada', 'Escudos'];

  competencias: Competencias = {
    bonusDeProficiencia: 2,
    percepcaoPassiva: 10,
    inspiracaoHeroica: false,
    salvaguardas: {
      FORÇA: { valor: 0, proficiente: false },
      DESTREZA: { valor: 0, proficiente: false },
      CONSTITUIÇÃO: { valor: 0, proficiente: false },
      INTELIGÊNCIA: { valor: 0, proficiente: false },
      SABEDORIA: { valor: 0, proficiente: false },
      CARISMA: { valor: 0, proficiente: false },
    },
    pericias: {},
    proficiencias: {
      armaduras: [],
      armas: [],
      ferramentas: [],
      idiomas: [],
    },
  };

  // Arrays para inputs dinâmicos
  novasArmas: string[] = [];
  novasFerramentas: string[] = [];
  novosIdiomas: string[] = [];

  ngOnInit() {
    this.inicializarPericias();
    this.carregarCompetencias();
  }

  inicializarPericias() {
    this.periciasList.forEach((pericia) => {
      this.competencias.pericias[pericia.nome] = {
        valor: 0,
        proficiente: false,
        atributo: pericia.atributo,
      };
    });
  }

  carregarCompetencias() {
    const saved = localStorage.getItem('competencias');
    if (saved) {
      this.competencias = JSON.parse(saved);
      // Garantir que todas as perícias existem
      this.periciasList.forEach((pericia) => {
        if (!this.competencias.pericias[pericia.nome]) {
          this.competencias.pericias[pericia.nome] = {
            valor: 0,
            proficiente: false,
            atributo: pericia.atributo,
          };
        }
      });
    }
  }

  saveCompetencias() {
    localStorage.setItem('competencias', JSON.stringify(this.competencias));
    this.isEditMode = false;
    console.log('Competências salvas:', this.competencias);
  }

  editCompetencias() {
    this.isEditMode = true;
  }

  resetCompetencias() {
    if (confirm('Tem certeza que deseja resetar todas as competências?')) {
      this.competencias = {
        bonusDeProficiencia: 2,
        percepcaoPassiva: 10,
        inspiracaoHeroica: false,
        salvaguardas: {
          FORÇA: { valor: 0, proficiente: false },
          DESTREZA: { valor: 0, proficiente: false },
          CONSTITUIÇÃO: { valor: 0, proficiente: false },
          INTELIGÊNCIA: { valor: 0, proficiente: false },
          SABEDORIA: { valor: 0, proficiente: false },
          CARISMA: { valor: 0, proficiente: false },
        },
        pericias: {},
        proficiencias: {
          armaduras: [],
          armas: [],
          ferramentas: [],
          idiomas: [],
        },
      };
      this.inicializarPericias();
      this.novasArmas = [];
      this.novasFerramentas = [];
      this.novosIdiomas = [];
      localStorage.removeItem('competencias');
    }
  }

  toggleProficienciaSalvaguarda(atributo: string) {
    if (this.isEditMode) {
      this.competencias.salvaguardas[atributo].proficiente =
        !this.competencias.salvaguardas[atributo].proficiente;
    }
  }

  toggleProficienciaPericia(pericia: string) {
    if (this.isEditMode) {
      this.competencias.pericias[pericia].proficiente =
        !this.competencias.pericias[pericia].proficiente;
    }
  }

  toggleArmadura(armadura: string) {
    if (this.isEditMode) {
      const index = this.competencias.proficiencias.armaduras.indexOf(armadura);
      if (index > -1) {
        this.competencias.proficiencias.armaduras.splice(index, 1);
      } else {
        this.competencias.proficiencias.armaduras.push(armadura);
      }
    }
  }

  isArmaduraSelecionada(armadura: string): boolean {
    return this.competencias.proficiencias.armaduras.includes(armadura);
  }

  adicionarArma() {
    if (this.novasArmas.length < 10) {
      this.novasArmas.push('');
    }
  }

  removerArma(index: number) {
    this.novasArmas.splice(index, 1);
    this.competencias.proficiencias.armas.splice(index, 1);
  }

  adicionarFerramenta() {
    if (this.novasFerramentas.length < 10) {
      this.novasFerramentas.push('');
    }
  }

  removerFerramenta(index: number) {
    this.novasFerramentas.splice(index, 1);
    this.competencias.proficiencias.ferramentas.splice(index, 1);
  }

  adicionarIdioma() {
    if (this.novosIdiomas.length < 10) {
      this.novosIdiomas.push('');
    }
  }

  removerIdioma(index: number) {
    this.novosIdiomas.splice(index, 1);
    this.competencias.proficiencias.idiomas.splice(index, 1);
  }

  calcularBonusTotal(pericia: string): number {
    const periciaData = this.competencias.pericias[pericia];
    const bonus = periciaData.proficiente
      ? periciaData.valor + this.competencias.bonusDeProficiencia
      : periciaData.valor;
    return bonus;
  }

  calcularBonusSalvaguarda(atributo: string): number {
    const salvaguarda = this.competencias.salvaguardas[atributo];
    const bonus = salvaguarda.proficiente
      ? salvaguarda.valor + this.competencias.bonusDeProficiencia
      : salvaguarda.valor;
    return bonus;
  }

  formatarBonus(valor: number): string {
    return valor >= 0 ? `+${valor}` : `${valor}`;
  }

  getSalvaguardasKeys(): string[] {
    return Object.keys(this.competencias.salvaguardas);
  }

  getPericiasKeys(): string[] {
    return Object.keys(this.competencias.pericias);
  }

  getPericiasPorAtributo(atributo: string): string[] {
    return this.periciasList.filter((p) => p.atributo === atributo).map((p) => p.nome);
  }

  getAtributoAbreviado(atributo: string): string {
    const abreviacoes: { [key: string]: string } = {
      FOR: 'Força',
      DES: 'Destreza',
      CON: 'Constituição',
      INT: 'Inteligência',
      SAB: 'Sabedoria',
      CAR: 'Carisma',
    };
    return abreviacoes[atributo] || atributo;
  }
}
