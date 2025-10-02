# Guia de Variáveis CSS - Tomo do Aventureiro

Este documento descreve o sistema de variáveis CSS usado no projeto para manter consistência visual.

## Paleta de Cores Principal

### Cores Primárias (Tons de Roxo/Lilás)

```css
--color-primary-lightest: #c5b0d9   /* Lilás mais claro */
--color-primary-light: #b39fc7      /* Lilás claro */
--color-primary: #a18db5            /* Lilás médio (cor principal) */
--color-primary-dark: #8f7ca2       /* Lilás escuro */
--color-primary-darkest: #7d6a90    /* Lilás mais escuro */
```

### Cores Neutras

```css
--color-white: #ffffff              /* Branco puro */
--color-ice: #f8f9fa               /* Branco gelo (background) */
--color-black: #010101             /* Preto */
```

## Alias para Facilitar o Uso

### Cores Principais

```css
--primary: var(--color-primary)
--primary-light: var(--color-primary-light)
--primary-dark: var(--color-primary-dark)
--background: var(--color-ice)
--text-primary: var(--color-black)
--text-secondary: var(--color-primary-darkest)
```

### Gradientes

```css
--gradient-primary: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-dark) 100%)
--gradient-header: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-darkest) 100%)
```

### Sombras

```css
--shadow-light: 0 2px 8px rgba(125, 106, 144, 0.1)
--shadow-medium: 0 4px 16px rgba(125, 106, 144, 0.15)
--shadow-heavy: 0 8px 32px rgba(125, 106, 144, 0.2)
```

### Estados de Interação

```css
--hover-opacity: 0.8
--active-opacity: 0.6
--disabled-opacity: 0.4
```

## Classes Utilitárias

### Cores de Texto

```css
.text-primary        /* Cor primária */
/* Cor primária */
.text-primary-light  /* Cor primária clara */
.text-primary-dark   /* Cor primária escura */
.text-secondary; /* Cor secundária */
```

### Cores de Background

```css
.bg-primary         /* Background primário */
/* Background primário */
.bg-primary-light   /* Background primário claro */
.bg-primary-dark    /* Background primário escuro */
.bg-gradient; /* Background com gradiente */
```

## Exemplos de Uso

### Em CSS

```css
.meu-componente {
  background-color: var(--color-primary);
  color: var(--color-white);
  box-shadow: var(--shadow-medium);
}

.meu-botao:hover {
  opacity: var(--hover-opacity);
}
```

### Em HTML com Classes Utilitárias

```html
<div class="bg-primary text-white">
  <h1 class="text-primary-light">Título</h1>
</div>
```

## Boas Práticas

1. **Sempre use as variáveis CSS** em vez de valores hardcoded
2. **Use os alias** quando possível para maior legibilidade
3. **Prefira as classes utilitárias** para estilos simples
4. **Mantenha consistência** usando sempre as mesmas variáveis
5. **Documente novos usos** quando criar novos componentes

## Adicionando Novas Variáveis

Se precisar adicionar novas variáveis, siga a convenção:

- `--color-[nome]-[variação]` para cores
- `--[propriedade]-[tamanho]` para outros valores
- Sempre adicione comentários explicativos
- Atualize este documento com as novas variáveis
