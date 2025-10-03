import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClasseDeArmadura {
  total: number;
  bonusEscudo: number;
}

interface PontosDeVida {
  maximos: number;
  atuais: number;
  temporarios: number;
  calculoAutomatico: boolean; // Se deve calcular automaticamente baseado em classes/nível
}

interface DadosDeVida {
  maximos: number;
  gastos: number;
  tipoDado: string; // 'd6', 'd8', 'd10', 'd12'
}

interface SalvaguardasContraMorte {
  sucessos: number;
  falhas: number;
}

interface StatusDeCombate {
  classeDeArmadura: ClasseDeArmadura;
  pontosDeVida: PontosDeVida;
  dadosDeVida: DadosDeVida;
  salvaguardasContraMorte: SalvaguardasContraMorte;
  iniciativa: number;
  deslocamento: number;
}

@Component({
  selector: 'app-combat-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './combat-status.component.html',
  styleUrl: './combat-status.component.css',
})
export class CombatStatusComponent implements OnInit {
  statusDeCombate: StatusDeCombate = {
    classeDeArmadura: {
      total: 10,
      bonusEscudo: 0,
    },
    pontosDeVida: {
      maximos: 10,
      atuais: 10,
      temporarios: 0,
      calculoAutomatico: false,
    },
    dadosDeVida: {
      maximos: 1,
      gastos: 0,
      tipoDado: 'd8',
    },
    salvaguardasContraMorte: {
      sucessos: 0,
      falhas: 0,
    },
    iniciativa: 0,
    deslocamento: 9,
  };

  isEditMode: boolean = true;

  // Opções de tipos de dados
  tiposDado = ['d6', 'd8', 'd10', 'd12'];

  ngOnInit() {
    this.loadCombatStatus();
    this.carregarDadosBasicInfo();
  }

  /**
   * Incrementa o valor de sucessos nas salvaguardas contra morte
   */
  incrementarSucessos() {
    if (this.isEditMode && this.statusDeCombate.salvaguardasContraMorte.sucessos < 3) {
      this.statusDeCombate.salvaguardasContraMorte.sucessos++;
    }
  }

  /**
   * Decrementa o valor de sucessos nas salvaguardas contra morte
   */
  decrementarSucessos() {
    if (this.isEditMode && this.statusDeCombate.salvaguardasContraMorte.sucessos > 0) {
      this.statusDeCombate.salvaguardasContraMorte.sucessos--;
    }
  }

  /**
   * Incrementa o valor de falhas nas salvaguardas contra morte
   */
  incrementarFalhas() {
    if (this.isEditMode && this.statusDeCombate.salvaguardasContraMorte.falhas < 3) {
      this.statusDeCombate.salvaguardasContraMorte.falhas++;
    }
  }

  /**
   * Decrementa o valor de falhas nas salvaguardas contra morte
   */
  decrementarFalhas() {
    if (this.isEditMode && this.statusDeCombate.salvaguardasContraMorte.falhas > 0) {
      this.statusDeCombate.salvaguardasContraMorte.falhas--;
    }
  }

  /**
   * Reseta as salvaguardas contra morte
   */
  resetarSalvaguardas() {
    if (this.isEditMode) {
      this.statusDeCombate.salvaguardasContraMorte.sucessos = 0;
      this.statusDeCombate.salvaguardasContraMorte.falhas = 0;
    }
  }

  /**
   * Calcula a CA total (base + escudo)
   */
  calcularCATotal(): number {
    return (
      this.statusDeCombate.classeDeArmadura.total +
      this.statusDeCombate.classeDeArmadura.bonusEscudo
    );
  }

  /**
   * Carrega dados do localStorage de BasicInfo para cálculo automático
   */
  carregarDadosBasicInfo() {
    const basicInfoSaved = localStorage.getItem('basicInfo');
    const atributosSaved = localStorage.getItem('atributos');

    if (basicInfoSaved && atributosSaved && this.statusDeCombate.pontosDeVida.calculoAutomatico) {
      const basicInfo = JSON.parse(basicInfoSaved);
      const atributos = JSON.parse(atributosSaved);

      // Calcular PV automaticamente
      this.calcularPVAutomatico(
        basicInfo.nivel || 1,
        basicInfo.classe,
        atributos.constituicao?.modificador || 0
      );
    }
  }

  /**
   * Calcula PV máximo automaticamente baseado nas regras do D&D 5e
   * Fórmula: (Média do dado de vida + Mod CON) × Nível
   * Primeiro nível: Valor máximo do dado + Mod CON
   */
  calcularPVAutomatico(nivel: number, classe: string, modConstituicao: number) {
    if (!nivel || nivel < 1) {
      nivel = 1;
    }

    // Média dos dados de vida (metade do valor máximo + 1)
    const mediaDado = this.obterMediaDadoVida(this.statusDeCombate.dadosDeVida.tipoDado);
    const valorMaximoDado = this.obterValorMaximoDado(this.statusDeCombate.dadosDeVida.tipoDado);

    // Primeiro nível: valor máximo do dado + mod CON
    const pvPrimeiroNivel = valorMaximoDado + modConstituicao;

    // Níveis seguintes: média do dado + mod CON (por nível)
    const pvNiveisRestantes = (nivel - 1) * (mediaDado + modConstituicao);

    // PV total
    const pvTotal = pvPrimeiroNivel + pvNiveisRestantes;

    // Atualizar PV máximo
    this.statusDeCombate.pontosDeVida.maximos = Math.max(1, pvTotal); // Mínimo 1 PV

    // Se PV atual for maior que o novo máximo, ajustar
    if (this.statusDeCombate.pontosDeVida.atuais > this.statusDeCombate.pontosDeVida.maximos) {
      this.statusDeCombate.pontosDeVida.atuais = this.statusDeCombate.pontosDeVida.maximos;
    }
  }

  /**
   * Retorna a média do dado de vida (usado para calcular PV)
   */
  obterMediaDadoVida(tipoDado: string): number {
    const medias: { [key: string]: number } = {
      d6: 4, // (6 / 2) + 1
      d8: 5, // (8 / 2) + 1
      d10: 6, // (10 / 2) + 1
      d12: 7, // (12 / 2) + 1
    };
    return medias[tipoDado] || 5;
  }

  /**
   * Retorna o valor máximo do dado de vida
   */
  obterValorMaximoDado(tipoDado: string): number {
    const valores: { [key: string]: number } = {
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
    };
    return valores[tipoDado] || 8;
  }

  /**
   * Alterna entre cálculo automático e manual de PV
   */
  toggleCalculoAutomatico() {
    this.statusDeCombate.pontosDeVida.calculoAutomatico =
      !this.statusDeCombate.pontosDeVida.calculoAutomatico;

    if (this.statusDeCombate.pontosDeVida.calculoAutomatico) {
      this.carregarDadosBasicInfo();
    }
  }

  /**
   * Atualiza o cálculo quando o tipo de dado muda
   */
  onTipoDadoChange() {
    // Se cálculo automático está ativo, recalcular PV
    if (this.statusDeCombate.pontosDeVida.calculoAutomatico) {
      this.carregarDadosBasicInfo();
    }
  }

  /**
   * Valida os pontos de vida atuais
   */
  validarPontosDeVida() {
    const pv = this.statusDeCombate.pontosDeVida;

    // Não pode ter PV atuais maior que máximo
    if (pv.atuais > pv.maximos) {
      pv.atuais = pv.maximos;
    }

    // Não pode ter PV atuais negativo
    if (pv.atuais < 0) {
      pv.atuais = 0;
    }

    // Não pode ter PV temporários negativo
    if (pv.temporarios < 0) {
      pv.temporarios = 0;
    }
  }

  /**
   * Valida os dados de vida gastos
   */
  validarDadosDeVida() {
    const dv = this.statusDeCombate.dadosDeVida;

    // Não pode gastar mais dados do que tem
    if (dv.gastos > dv.maximos) {
      dv.gastos = dv.maximos;
    }

    // Não pode ter dados gastos negativo
    if (dv.gastos < 0) {
      dv.gastos = 0;
    }
  }

  saveCombatStatus() {
    // Validações antes de salvar
    this.validarPontosDeVida();
    this.validarDadosDeVida();

    // Salvar no localStorage
    localStorage.setItem('statusDeCombate', JSON.stringify(this.statusDeCombate));
    console.log('Status de combate salvo:', this.statusDeCombate);

    // Desabilitar modo de edição após salvar
    this.isEditMode = false;

    // Feedback visual
    alert('Status de combate salvo com sucesso!');
  }

  editCombatStatus() {
    // Habilitar modo de edição
    this.isEditMode = true;
    console.log('Modo de edição ativado');
  }

  resetCombatStatus() {
    if (confirm('Tem certeza que deseja resetar todo o status de combate?')) {
      this.statusDeCombate = {
        classeDeArmadura: {
          total: 10,
          bonusEscudo: 0,
        },
        pontosDeVida: {
          maximos: 10,
          atuais: 10,
          temporarios: 0,
          calculoAutomatico: false,
        },
        dadosDeVida: {
          maximos: 1,
          gastos: 0,
          tipoDado: 'd8',
        },
        salvaguardasContraMorte: {
          sucessos: 0,
          falhas: 0,
        },
        iniciativa: 0,
        deslocamento: 9,
      };
      localStorage.removeItem('statusDeCombate');
      this.isEditMode = true;
    }
  }

  loadCombatStatus() {
    const saved = localStorage.getItem('statusDeCombate');
    if (saved) {
      this.statusDeCombate = JSON.parse(saved);
      this.isEditMode = false;
    }
  }
}
