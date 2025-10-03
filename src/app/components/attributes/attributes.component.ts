import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Atributo {
  valor: number;
  modificador: number;
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
    forca: { valor: 10, modificador: 0 },
    destreza: { valor: 10, modificador: 0 },
    constituicao: { valor: 10, modificador: 0 },
    inteligencia: { valor: 10, modificador: 0 },
    sabedoria: { valor: 10, modificador: 0 },
    carisma: { valor: 10, modificador: 0 },
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
  }

  /**
   * Formata o modificador com sinal + ou -
   */
  formatarModificador(modificador: number): string {
    return modificador >= 0 ? `+${modificador}` : `${modificador}`;
  }

  saveAttributes() {
    // Salvar no localStorage
    localStorage.setItem('atributos', JSON.stringify(this.atributos));
    console.log('Atributos salvos:', this.atributos);

    // Desabilitar modo de edição após salvar
    this.isEditMode = false;

    // Feedback visual
    alert('Atributos salvos com sucesso!');
  }

  editAttributes() {
    // Habilitar modo de edição
    this.isEditMode = true;
    console.log('Modo de edição ativado');
  }

  resetAttributes() {
    if (confirm('Tem certeza que deseja resetar todos os atributos?')) {
      this.atributos = {
        forca: { valor: 10, modificador: 0 },
        destreza: { valor: 10, modificador: 0 },
        constituicao: { valor: 10, modificador: 0 },
        inteligencia: { valor: 10, modificador: 0 },
        sabedoria: { valor: 10, modificador: 0 },
        carisma: { valor: 10, modificador: 0 },
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
