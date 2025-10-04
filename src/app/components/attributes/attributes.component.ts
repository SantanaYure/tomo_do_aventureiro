import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Atributo {
  valor: number;
  modificador: number;
  proficiente: boolean;
}

interface Atributos {
  forca: Atributo;
  destreza: Atributo;
  constituicao: Atributo;
  inteligencia: Atributo;
  sabedoria: Atributo;
  carisma: Atributo;
}

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attributes.component.html',
  styleUrl: './attributes.component.css',
})
export class AttributesComponent implements OnInit {
  atributos: Atributos = {
    forca: { valor: 10, modificador: 0, proficiente: false },
    destreza: { valor: 10, modificador: 0, proficiente: false },
    constituicao: { valor: 10, modificador: 0, proficiente: false },
    inteligencia: { valor: 10, modificador: 0, proficiente: false },
    sabedoria: { valor: 10, modificador: 0, proficiente: false },
    carisma: { valor: 10, modificador: 0, proficiente: false },
  };

  isEditMode: boolean = true;

  ngOnInit() {
    this.loadAttributes();
  }

  /**
   * Calcula o modificador de atributo seguindo as regras do D&D 5e
   * Modificador = (Valor do Atributo - 10) / 2 (arredondado para baixo)
   */
  calcularModificador(valor: number): number {
    return Math.floor((valor - 10) / 2);
  }

  /**
   * Atualiza o modificador quando o valor do atributo é alterado
   */
  onAtributoChange(atributo: keyof Atributos) {
    const valor = this.atributos[atributo].valor;

    // Limitar valores entre 1 e 30 (limite do D&D)
    if (valor < 1) {
      this.atributos[atributo].valor = 1;
    } else if (valor > 30) {
      this.atributos[atributo].valor = 30;
    }

    // Calcular o modificador
    this.atributos[atributo].modificador = this.calcularModificador(this.atributos[atributo].valor);

    // Salvar automaticamente no localStorage para sincronização imediata
    localStorage.setItem('atributos', JSON.stringify(this.atributos));

    // Disparar evento para outros componentes saberem da mudança imediatamente
    window.dispatchEvent(
      new CustomEvent('atributos-atualizados', {
        detail: this.atributos,
      })
    );
  }

  /**
   * Formata o modificador com sinal + ou -
   */
  formatarModificador(modificador: number): string {
    return modificador >= 0 ? `+${modificador}` : `${modificador}`;
  }

  /**
   * Retorna o valor a ser exibido (modificador ou salvaguarda se proficiente)
   */
  getValorExibicao(atributo: keyof Atributos): number {
    const modificador = this.atributos[atributo].modificador;
    const proficiente = this.atributos[atributo].proficiente;

    if (proficiente) {
      const bonusProficiencia = this.getBonusProficiencia();
      return modificador + bonusProficiencia;
    }

    return modificador;
  }

  /**
   * Calcula o bônus de salvaguarda (modificador + bônus de proficiência se proficiente)
   */
  calcularBonusSalvaguarda(atributo: keyof Atributos): number {
    const bonusProficiencia = this.getBonusProficiencia();
    const modificador = this.atributos[atributo].modificador;
    const proficiente = this.atributos[atributo].proficiente;

    return proficiente ? modificador + bonusProficiencia : modificador;
  }

  /**
   * Obtém o bônus de proficiência do localStorage de competências
   */
  getBonusProficiencia(): number {
    const savedCompetencias = localStorage.getItem('competencias');
    if (savedCompetencias) {
      const competencias = JSON.parse(savedCompetencias);
      return competencias.bonusDeProficiencia || 2;
    }
    return 2; // Valor padrão
  }

  /**
   * Formata o bônus de salvaguarda com sinal + ou -
   */
  formatarBonusSalvaguarda(atributo: keyof Atributos): string {
    const bonus = this.calcularBonusSalvaguarda(atributo);
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  }

  toggleProficiencia(atributo: keyof Atributos) {
    if (this.isEditMode) {
      this.atributos[atributo].proficiente = !this.atributos[atributo].proficiente;

      // Salvar automaticamente no localStorage para sincronização imediata
      localStorage.setItem('atributos', JSON.stringify(this.atributos));

      // Disparar evento para outros componentes saberem da mudança imediatamente
      window.dispatchEvent(
        new CustomEvent('atributos-atualizados', {
          detail: this.atributos,
        })
      );
    }
  }

  saveAttributes() {
    // Salvar no localStorage
    localStorage.setItem('atributos', JSON.stringify(this.atributos));
    console.log('Atributos salvos:', this.atributos);

    // Desabilitar modo de edição após salvar
    this.isEditMode = false;

    // Disparar evento de atualização (para outros componentes saberem)
    window.dispatchEvent(
      new CustomEvent('atributos-atualizados', {
        detail: this.atributos,
      })
    );
  }

  editAttributes() {
    // Habilitar modo de edição
    this.isEditMode = true;
    console.log('Modo de edição ativado');
  }

  resetAttributes() {
    if (confirm('Tem certeza que deseja resetar todos os atributos?')) {
      this.atributos = {
        forca: { valor: 10, modificador: 0, proficiente: false },
        destreza: { valor: 10, modificador: 0, proficiente: false },
        constituicao: { valor: 10, modificador: 0, proficiente: false },
        inteligencia: { valor: 10, modificador: 0, proficiente: false },
        sabedoria: { valor: 10, modificador: 0, proficiente: false },
        carisma: { valor: 10, modificador: 0, proficiente: false },
      };
      localStorage.removeItem('atributos');
      this.isEditMode = true;
    }
  }

  loadAttributes() {
    const saved = localStorage.getItem('atributos');
    if (saved) {
      this.atributos = JSON.parse(saved);
      this.isEditMode = false;
    }
  }
}
