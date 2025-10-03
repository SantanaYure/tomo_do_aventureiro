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
}

interface DadosDeVida {
  maximos: number;
  gastos: number;
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
    },
    dadosDeVida: {
      maximos: 1,
      gastos: 0,
    },
    salvaguardasContraMorte: {
      sucessos: 0,
      falhas: 0,
    },
    iniciativa: 0,
    deslocamento: 30,
  };

  isEditMode: boolean = true;

  ngOnInit() {
    this.loadCombatStatus();
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
        },
        dadosDeVida: {
          maximos: 1,
          gastos: 0,
        },
        salvaguardasContraMorte: {
          sucessos: 0,
          falhas: 0,
        },
        iniciativa: 0,
        deslocamento: 30,
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
