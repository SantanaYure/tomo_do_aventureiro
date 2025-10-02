# Bootstrap Configurado no Projeto

## ✅ Instalação Concluída

O Bootstrap foi instalado e configurado com sucesso no projeto Angular "Tomo do Aventureiro".

## 📦 Dependências Instaladas

- `bootstrap` - Framework CSS completo
- `@popperjs/core` - Biblioteca necessária para componentes interativos do Bootstrap

## ⚙️ Configurações Realizadas

### 1. Angular.json

- ✅ Bootstrap CSS adicionado aos estilos globais
- ✅ Bootstrap JavaScript adicionado aos scripts globais
- ✅ Configuração aplicada tanto para build quanto para testes

### 2. Estilos Globais (styles.css)

- ✅ Comentários e estrutura base para customizações
- ✅ Fontes padrão configuradas

### 3. Serviço Bootstrap (bootstrap.service.ts)

- ✅ Serviço criado para gerenciar componentes JavaScript
- ✅ Métodos para tooltips, popovers e modals
- ✅ Injeção de dependência configurada

### 4. Componente de Exemplo

- ✅ Componente com exemplos práticos criado
- ✅ Demonstra cards, alertas, formulários, botões, etc.
- ✅ Includes modals, tooltips e popovers funcionais

## 🚀 Como Usar

### Classes CSS Básicas

```html
<!-- Containers -->
<div class="container">Conteúdo centralizado</div>
<div class="container-fluid">Conteúdo full-width</div>

<!-- Grid System -->
<div class="row">
  <div class="col-md-6">Coluna 1</div>
  <div class="col-md-6">Coluna 2</div>
</div>

<!-- Botões -->
<button class="btn btn-primary">Primário</button>
<button class="btn btn-success">Sucesso</button>
<button class="btn btn-danger">Perigo</button>

<!-- Cards -->
<div class="card">
  <div class="card-header">Cabeçalho</div>
  <div class="card-body">Conteúdo</div>
</div>
```

### Componentes Interativos

#### Tooltips

```html
<button class="btn btn-primary" data-bs-toggle="tooltip" title="Texto do tooltip">Hover me</button>
```

#### Modals

```html
<!-- Botão que abre modal -->
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#meuModal">
  Abrir Modal
</button>

<!-- Modal -->
<div class="modal fade" id="meuModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Título</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Conteúdo</div>
    </div>
  </div>
</div>
```

### Usando o BootstrapService

```typescript
import { BootstrapService } from './services/bootstrap.service';

constructor(private bootstrapService: BootstrapService) {}

ngOnInit() {
  // Inicializar tooltips
  this.bootstrapService.initTooltips();

  // Inicializar popovers
  this.bootstrapService.initPopovers();
}

// Abrir modal programaticamente
openModal() {
  this.bootstrapService.openModal('meuModal');
}
```

## 🎨 Customização

Você pode customizar o Bootstrap editando o arquivo `src/styles.css`:

```css
/* Customizar cores primárias */
:root {
  --bs-primary: #your-color;
  --bs-secondary: #your-color;
}

/* Customizar componentes */
.btn {
  border-radius: 8px;
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## 📚 Recursos Úteis

- [Documentação oficial do Bootstrap](https://getbootstrap.com/docs/5.3/)
- [Grid System](https://getbootstrap.com/docs/5.3/layout/grid/)
- [Componentes](https://getbootstrap.com/docs/5.3/components/)
- [Utilitários](https://getbootstrap.com/docs/5.3/utilities/)

## 🔧 Próximos Passos

1. Use as classes do Bootstrap nos seus componentes
2. Customize o tema conforme o design do projeto
3. Implemente componentes específicos para RPG
4. Use o BootstrapService para funcionalidades avançadas

O Bootstrap está 100% configurado e pronto para uso! 🎉
