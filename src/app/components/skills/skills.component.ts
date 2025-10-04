import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class SkillsComponent implements OnInit, OnDestroy {
  isEditMode = false;

  private atributosListener: any;
  private storageListener: any;

  // Cache de salvaguardas proficientes para atualização dinâmica
  salvaguardasProficientes: string[] = [];

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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('🔵 Skills Component - ngOnInit chamado');
    this.inicializarPericias();
    this.carregarCompetencias(); // Carrega primeiro as competências salvas
    this.carregarAtributos(); // Depois atualiza apenas os valores dos atributos E atualiza salvaguardas proficientes

    // Listener para atualizar quando atributos mudarem via evento customizado
    this.atributosListener = () => {
      console.log('🟢 Evento atributos-atualizados capturado!');
      this.carregarAtributos();
      this.cdr.detectChanges(); // Força detecção de mudanças
    };
    window.addEventListener('atributos-atualizados', this.atributosListener);
    console.log('👂 Listener de atributos registrado');

    // Listener adicional para mudanças no localStorage (fallback)
    this.storageListener = (e: StorageEvent) => {
      if (e.key === 'atributos' && e.newValue) {
        console.log('💾 Storage event capturado para atributos!');
        this.carregarAtributos();
        this.cdr.detectChanges();
      }
    };
    window.addEventListener('storage', this.storageListener);
    console.log('👂 Listener de storage registrado');
  }

  ngOnDestroy() {
    console.log('🔴 Skills Component - ngOnDestroy chamado');
    // Remover listener ao destruir componente
    if (this.atributosListener) {
      window.removeEventListener('atributos-atualizados', this.atributosListener);
      console.log('👋 Listener de atributos removido');
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      console.log('👋 Listener de storage removido');
    }
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

  carregarAtributos() {
    const savedAtributos = localStorage.getItem('atributos');
    if (savedAtributos) {
      const atributos = JSON.parse(savedAtributos);
      console.log('Atributos carregados:', atributos);

      // Mapeamento de nomes de atributos
      const mapeamento: { [key: string]: string } = {
        FORÇA: 'forca',
        DESTREZA: 'destreza',
        CONSTITUIÇÃO: 'constituicao',
        INTELIGÊNCIA: 'inteligencia',
        SABEDORIA: 'sabedoria',
        CARISMA: 'carisma',
      };

      // Atualizar APENAS os valores (modificadores) das salvaguardas, preservando proficiências
      Object.keys(this.competencias.salvaguardas).forEach((atributo) => {
        const nomeAtributo = mapeamento[atributo];
        if (nomeAtributo && atributos[nomeAtributo]) {
          this.competencias.salvaguardas[atributo].valor = atributos[nomeAtributo].modificador;
          // Só atualiza proficiência se não houver dados salvos de competências
          const savedCompetencias = localStorage.getItem('competencias');
          if (!savedCompetencias) {
            this.competencias.salvaguardas[atributo].proficiente =
              atributos[nomeAtributo].proficiente || false;
          }
        }
      });

      // Atualizar lista de salvaguardas proficientes para exibição dinâmica
      this.atualizarSalvaguardasProficientes();

      // Atualizar APENAS os modificadores das perícias, preservando proficiências
      this.periciasList.forEach((pericia) => {
        const abreviacoes: { [key: string]: string } = {
          FOR: 'forca',
          DES: 'destreza',
          CON: 'constituicao',
          INT: 'inteligencia',
          SAB: 'sabedoria',
          CAR: 'carisma',
        };

        const nomeAtributo = abreviacoes[pericia.atributo];
        if (nomeAtributo && atributos[nomeAtributo]) {
          this.competencias.pericias[pericia.nome].valor = atributos[nomeAtributo].modificador;
        }
      });

      // Calcular percepção passiva automaticamente
      this.calcularPercepcaoPassiva(atributos);
    } else {
      console.log('⚠️ Nenhum atributo salvo no localStorage');
      // Limpar salvaguardas proficientes se não houver atributos salvos
      this.salvaguardasProficientes = [];
    }
  }

  calcularPercepcaoPassiva(atributos: any) {
    // Percepção Passiva = 10 + Modificador de Sabedoria + Bônus de Proficiência (se proficiente)
    const modSabedoria = atributos.sabedoria?.modificador || 0;
    const proficientePercepcao = this.competencias.pericias['Percepção']?.proficiente || false;
    const bonus = proficientePercepcao ? this.competencias.bonusDeProficiencia : 0;
    this.competencias.percepcaoPassiva = 10 + modSabedoria + bonus;
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
    // Limpar arrays de strings vazias antes de salvar
    this.competencias.proficiencias.armas = this.competencias.proficiencias.armas.filter(
      (arma) => arma && arma.trim() !== ''
    );
    this.competencias.proficiencias.ferramentas =
      this.competencias.proficiencias.ferramentas.filter(
        (ferramenta) => ferramenta && ferramenta.trim() !== ''
      );
    this.competencias.proficiencias.idiomas = this.competencias.proficiencias.idiomas.filter(
      (idioma) => idioma && idioma.trim() !== ''
    );

    // Adicionar novos items dos arrays temporários
    this.novasArmas.forEach((arma) => {
      if (arma && arma.trim() !== '') {
        this.competencias.proficiencias.armas.push(arma.trim());
      }
    });
    this.novasFerramentas.forEach((ferramenta) => {
      if (ferramenta && ferramenta.trim() !== '') {
        this.competencias.proficiencias.ferramentas.push(ferramenta.trim());
      }
    });
    this.novosIdiomas.forEach((idioma) => {
      if (idioma && idioma.trim() !== '') {
        this.competencias.proficiencias.idiomas.push(idioma.trim());
      }
    });

    // Limpar arrays temporários
    this.novasArmas = [];
    this.novasFerramentas = [];
    this.novosIdiomas = [];

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
    this.competencias.proficiencias.armas.splice(index, 1);
  }

  removerNovaArma(index: number) {
    this.novasArmas.splice(index, 1);
  }

  adicionarFerramenta() {
    if (this.novasFerramentas.length < 10) {
      this.novasFerramentas.push('');
    }
  }

  removerFerramenta(index: number) {
    this.competencias.proficiencias.ferramentas.splice(index, 1);
  }

  removerNovaFerramenta(index: number) {
    this.novasFerramentas.splice(index, 1);
  }

  adicionarIdioma() {
    if (this.novosIdiomas.length < 10) {
      this.novosIdiomas.push('');
    }
  }

  removerIdioma(index: number) {
    this.competencias.proficiencias.idiomas.splice(index, 1);
  }

  removerNovoIdioma(index: number) {
    this.novosIdiomas.splice(index, 1);
  }

  calcularBonusTotal(pericia: string): number {
    const periciaData = this.competencias.pericias[pericia];
    const bonus = periciaData.proficiente
      ? periciaData.valor + this.competencias.bonusDeProficiencia
      : periciaData.valor;
    return bonus;
  }

  calcularBonusSalvaguarda(atributo: string): number {
    // Buscar o estado de proficiência dos atributos (não das salvaguardas)
    const atributosData = JSON.parse(localStorage.getItem('atributos') || '{}');
    const atributoNormalizado = atributo.toLowerCase();
    const isProficiente = atributosData[atributoNormalizado]?.proficiente || false;

    const salvaguarda = this.competencias.salvaguardas[atributo];
    const bonus = isProficiente
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

  /**
   * Atualiza a lista de salvaguardas proficientes baseado nos atributos
   */
  atualizarSalvaguardasProficientes(): void {
    const atributosData = JSON.parse(localStorage.getItem('atributos') || '{}');
    console.log('=== ATUALIZANDO SALVAGUARDAS PROFICIENTES ===');
    console.log('Dados dos atributos do localStorage:', atributosData);

    const mapeamento: { [key: string]: string } = {
      forca: 'FORÇA',
      destreza: 'DESTREZA',
      constituicao: 'CONSTITUIÇÃO',
      inteligencia: 'INTELIGÊNCIA',
      sabedoria: 'SABEDORIA',
      carisma: 'CARISMA',
    };

    // Criar um NOVO array para forçar detecção de mudança do Angular
    const novaLista = Object.keys(atributosData)
      .filter((atributo) => {
        const isProficiente = atributosData[atributo].proficiente === true;
        console.log(
          `${atributo}: proficiente = ${isProficiente}, valor = ${atributosData[atributo].valor}, modificador = ${atributosData[atributo].modificador}`
        );
        return isProficiente;
      })
      .map((atributo) => mapeamento[atributo])
      .filter((nome) => nome !== undefined);

    console.log('Nova lista de salvaguardas proficientes:', novaLista);

    // Atualizar apenas se houver mudança
    if (JSON.stringify(this.salvaguardasProficientes) !== JSON.stringify(novaLista)) {
      this.salvaguardasProficientes = [...novaLista]; // Spread operator para criar novo array
      console.log('✅ Salvaguardas proficientes ATUALIZADAS:', this.salvaguardasProficientes);
    } else {
      console.log('⚠️ Nenhuma mudança detectada nas salvaguardas proficientes');
    }
  }
  getSalvaguardasProficientes(): string[] {
    // Retornar a lista cached para atualização dinâmica
    return this.salvaguardasProficientes;
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
