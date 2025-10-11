import { Injectable } from '@angular/core';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreImportService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Importa o template de personagem narrativo para o Firestore
   * Este método deve ser executado apenas uma vez para criar o template
   */
  async importNarrativeCharacterTemplate(): Promise<void> {
    const characterTemplateData = {
      nome: 'Personagem de Narrativa',
      descricao:
        'Um modelo completo para desenvolvimento de personagens para romances, contos e outras obras de ficção, focado em profundidade psicológica e arco narrativo.',
      estrutura: [
        {
          bloco: 'Identidade',
          icone: 'bi-person-badge',
          campos: [
            {
              name: 'nomeCompleto',
              label: 'Nome Completo',
              type: 'text',
              placeholder: 'O nome principal do personagem.',
            },
            {
              name: 'sexo',
              label: 'Sexo',
              type: 'text',
              placeholder: 'Masculino, Feminino, Não-binário, etc.',
            },
            {
              name: 'apelido',
              label: 'Apelido / Alcunha',
              type: 'text',
              placeholder: 'Como os outros o conhecem?',
            },
            {
              name: 'arquétipo',
              label: 'Arquétipo (Resumo em Uma Frase)',
              type: 'textarea',
              placeholder: "Ex: 'Um detetive amargurado que busca redenção.'",
            },
            {
              name: 'papelNaTrama',
              label: 'Papel na Trama',
              type: 'text',
              placeholder: 'Protagonista, Antagonista, Mentor, etc.',
            },
          ],
        },
        {
          bloco: 'Aparência',
          icone: 'bi-palette',
          campos: [
            {
              name: 'idade',
              label: 'Idade',
              type: 'text',
              placeholder: 'Idade cronológica e/ou aparente.',
            },
            {
              name: 'ocupacao',
              label: 'Ocupação / Profissão',
              type: 'text',
              placeholder: 'O que ele faz da vida?',
            },
            {
              name: 'descricaoFisica',
              label: 'Descrição Física',
              type: 'textarea',
              placeholder: 'Descreva a aparência geral, como se estivesse no livro.',
            },
            {
              name: 'tracosMarcantes',
              label: 'Traços Marcantes',
              type: 'textarea',
              placeholder: 'Detalhes visuais únicos (cicatrizes, tatuagens, um jeito de andar).',
            },
            {
              name: 'estiloVestir',
              label: 'Estilo de se Vestir',
              type: 'textarea',
              placeholder: 'O que suas roupas comunicam sobre sua personalidade?',
            },
          ],
        },
        {
          bloco: 'Personalidade',
          icone: 'bi-heart-half',
          campos: [
            {
              name: 'motivacaoPrincipal',
              label: 'Motivação Principal (O que ele quer?)',
              type: 'textarea',
              placeholder: 'O desejo que move suas ações (Segurança, Vingança, Poder, Amor).',
            },
            {
              name: 'maiorMedo',
              label: 'Maior Medo (O que ele teme?)',
              type: 'textarea',
              placeholder:
                'A fonte de sua maior vulnerabilidade (Solidão, Fracasso, Perder o controle).',
            },
            {
              name: 'qualidadesVirtudes',
              label: 'Qualidades / Virtudes',
              type: 'textarea',
              placeholder: 'Liste pelo menos 3 traços positivos (Leal, Corajoso, Honesto).',
            },
            {
              name: 'defeitosFalhas',
              label: 'Defeitos / Falhas',
              type: 'textarea',
              placeholder: 'Liste pelo menos 3 traços negativos (Teimoso, Impulsivo, Orgulhoso).',
            },
            {
              name: 'visaoDeMundo',
              label: 'Visão de Mundo / Filosofia',
              type: 'textarea',
              placeholder: 'É cínico, otimista, pragmático, niilista?',
            },
          ],
        },
        {
          bloco: 'História e Vínculos',
          icone: 'bi-book',
          campos: [
            {
              name: 'background',
              label: 'História de Origem (Background)',
              type: 'textarea',
              placeholder: 'Um resumo de seu passado e dos eventos que o moldaram.',
            },
            {
              name: 'oGrandeSegredo',
              label: 'O Grande Segredo',
              type: 'textarea',
              placeholder:
                'Algo que ele esconde de todos e que pode ser um ponto de virada na trama.',
            },
            {
              name: 'relacionamentosChave',
              label: 'Relacionamentos Chave',
              type: 'textarea',
              placeholder: 'Liste conexões importantes: Família, Aliados, Inimigos.',
            },
            {
              name: 'contextoSocial',
              label: 'Lugar no Mundo',
              type: 'text',
              placeholder: 'Qual sua posição social? É rico, pobre, marginalizado?',
            },
          ],
        },
        {
          bloco: 'Arco Narrativo',
          icone: 'bi-graph-up-arrow',
          campos: [
            {
              name: 'objetivoNaTrama',
              label: 'Objetivo na Trama',
              type: 'textarea',
              placeholder: 'O que o personagem quer alcançar especificamente nesta história?',
            },
            {
              name: 'conflitoInterno',
              label: 'Conflito Interno',
              type: 'textarea',
              placeholder: 'A principal batalha moral ou psicológica que ele enfrenta.',
            },
            {
              name: 'conflitoExterno',
              label: 'Conflito Externo',
              type: 'textarea',
              placeholder: 'O obstáculo ou antagonista principal que está em seu caminho.',
            },
            {
              name: 'arcoTransformacao',
              label: 'Arco de Transformação',
              type: 'textarea',
              placeholder:
                'Início: Como ele é?\nMeio: O que o força a mudar?\nFim: Como ele termina?',
            },
          ],
        },
        {
          bloco: 'Detalhes',
          icone: 'bi-mic-fill',
          campos: [
            {
              name: 'hobbies',
              label: 'Hobbies e Paixões',
              type: 'textarea',
              placeholder: 'O que ele faz no tempo livre?',
            },
            {
              name: 'tiquesGestos',
              label: 'Tiques e Gestos',
              type: 'text',
              placeholder:
                'Um hábito físico que o torna mais real (roer unhas, ajeitar os óculos).',
            },
            {
              name: 'modoDeFalar',
              label: 'Modo de Falar',
              type: 'textarea',
              placeholder: 'Usa gírias? É formal? Tem um bordão?',
            },
            {
              name: 'citacaoFavorita',
              label: 'Citação Favorita',
              type: 'text',
              placeholder: 'Uma frase que define sua filosofia.',
            },
          ],
        },
      ],
    };

    try {
      // Obtém a instância do Firestore do FirebaseService
      const firestore = this.firebaseService.getFirestore();

      // Referência ao documento específico
      const docRef = doc(firestore, 'templates', 'X9ncOgKwHyDCOZ0RsYOi');

      // Adiciona/sobrescreve o documento com os dados
      await setDoc(docRef, characterTemplateData);

      // Template importado com sucesso
      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Importa o template com merge (mantém campos existentes)
   */
  async importNarrativeCharacterTemplateWithMerge(): Promise<void> {
    const characterTemplateData = {
      nome: 'Personagem de Narrativa',
      descricao:
        'Um modelo completo para desenvolvimento de personagens para romances, contos e outras obras de ficção, focado em profundidade psicológica e arco narrativo.',
      estrutura: [
        {
          bloco: 'Identidade',
          icone: 'bi-person-badge',
          campos: [
            {
              name: 'nomeCompleto',
              label: 'Nome Completo',
              type: 'text',
              placeholder: 'O nome principal do personagem.',
            },
            {
              name: 'sexo',
              label: 'Sexo',
              type: 'text',
              placeholder: 'Masculino, Feminino, Não-binário, etc.',
            },
            {
              name: 'apelido',
              label: 'Apelido / Alcunha',
              type: 'text',
              placeholder: 'Como os outros o conhecem?',
            },
            {
              name: 'arquétipo',
              label: 'Arquétipo (Resumo em Uma Frase)',
              type: 'textarea',
              placeholder: "Ex: 'Um detetive amargurado que busca redenção.'",
            },
            {
              name: 'papelNaTrama',
              label: 'Papel na Trama',
              type: 'text',
              placeholder: 'Protagonista, Antagonista, Mentor, etc.',
            },
          ],
        },
        {
          bloco: 'Aparência',
          icone: 'bi-palette',
          campos: [
            {
              name: 'idade',
              label: 'Idade',
              type: 'text',
              placeholder: 'Idade cronológica e/ou aparente.',
            },
            {
              name: 'ocupacao',
              label: 'Ocupação / Profissão',
              type: 'text',
              placeholder: 'O que ele faz da vida?',
            },
            {
              name: 'descricaoFisica',
              label: 'Descrição Física',
              type: 'textarea',
              placeholder: 'Descreva a aparência geral, como se estivesse no livro.',
            },
            {
              name: 'tracosMarcantes',
              label: 'Traços Marcantes',
              type: 'textarea',
              placeholder: 'Detalhes visuais únicos (cicatrizes, tatuagens, um jeito de andar).',
            },
            {
              name: 'estiloVestir',
              label: 'Estilo de se Vestir',
              type: 'textarea',
              placeholder: 'O que suas roupas comunicam sobre sua personalidade?',
            },
          ],
        },
        {
          bloco: 'Personalidade',
          icone: 'bi-heart-half',
          campos: [
            {
              name: 'motivacaoPrincipal',
              label: 'Motivação Principal (O que ele quer?)',
              type: 'textarea',
              placeholder: 'O desejo que move suas ações (Segurança, Vingança, Poder, Amor).',
            },
            {
              name: 'maiorMedo',
              label: 'Maior Medo (O que ele teme?)',
              type: 'textarea',
              placeholder:
                'A fonte de sua maior vulnerabilidade (Solidão, Fracasso, Perder o controle).',
            },
            {
              name: 'qualidadesVirtudes',
              label: 'Qualidades / Virtudes',
              type: 'textarea',
              placeholder: 'Liste pelo menos 3 traços positivos (Leal, Corajoso, Honesto).',
            },
            {
              name: 'defeitosFalhas',
              label: 'Defeitos / Falhas',
              type: 'textarea',
              placeholder: 'Liste pelo menos 3 traços negativos (Teimoso, Impulsivo, Orgulhoso).',
            },
            {
              name: 'visaoDeMundo',
              label: 'Visão de Mundo / Filosofia',
              type: 'textarea',
              placeholder: 'É cínico, otimista, pragmático, niilista?',
            },
          ],
        },
        {
          bloco: 'História e Vínculos',
          icone: 'bi-book',
          campos: [
            {
              name: 'background',
              label: 'História de Origem (Background)',
              type: 'textarea',
              placeholder: 'Um resumo de seu passado e dos eventos que o moldaram.',
            },
            {
              name: 'oGrandeSegredo',
              label: 'O Grande Segredo',
              type: 'textarea',
              placeholder:
                'Algo que ele esconde de todos e que pode ser um ponto de virada na trama.',
            },
            {
              name: 'relacionamentosChave',
              label: 'Relacionamentos Chave',
              type: 'textarea',
              placeholder: 'Liste conexões importantes: Família, Aliados, Inimigos.',
            },
            {
              name: 'contextoSocial',
              label: 'Lugar no Mundo',
              type: 'text',
              placeholder: 'Qual sua posição social? É rico, pobre, marginalizado?',
            },
          ],
        },
        {
          bloco: 'Arco Narrativo',
          icone: 'bi-graph-up-arrow',
          campos: [
            {
              name: 'objetivoNaTrama',
              label: 'Objetivo na Trama',
              type: 'textarea',
              placeholder: 'O que o personagem quer alcançar especificamente nesta história?',
            },
            {
              name: 'conflitoInterno',
              label: 'Conflito Interno',
              type: 'textarea',
              placeholder: 'A principal batalha moral ou psicológica que ele enfrenta.',
            },
            {
              name: 'conflitoExterno',
              label: 'Conflito Externo',
              type: 'textarea',
              placeholder: 'O obstáculo ou antagonista principal que está em seu caminho.',
            },
            {
              name: 'arcoTransformacao',
              label: 'Arco de Transformação',
              type: 'textarea',
              placeholder:
                'Início: Como ele é?\nMeio: O que o força a mudar?\nFim: Como ele termina?',
            },
          ],
        },
        {
          bloco: 'Detalhes',
          icone: 'bi-mic-fill',
          campos: [
            {
              name: 'hobbies',
              label: 'Hobbies e Paixões',
              type: 'textarea',
              placeholder: 'O que ele faz no tempo livre?',
            },
            {
              name: 'tiquesGestos',
              label: 'Tiques e Gestos',
              type: 'text',
              placeholder:
                'Um hábito físico que o torna mais real (roer unhas, ajeitar os óculos).',
            },
            {
              name: 'modoDeFalar',
              label: 'Modo de Falar',
              type: 'textarea',
              placeholder: 'Usa gírias? É formal? Tem um bordão?',
            },
            {
              name: 'citacaoFavorita',
              label: 'Citação Favorita',
              type: 'text',
              placeholder: 'Uma frase que define sua filosofia.',
            },
          ],
        },
      ],
    };

    try {
      const firestore = this.firebaseService.getFirestore();
      const docRef = doc(firestore, 'templates', 'X9ncOgKwHyDCOZ0RsYOi');

      // Merge: mantém campos existentes e adiciona/atualiza novos
      await setDoc(docRef, characterTemplateData, { merge: true });

      // Template mesclado com sucesso
      return;
    } catch (error) {
      throw error;
    }
  }
}
