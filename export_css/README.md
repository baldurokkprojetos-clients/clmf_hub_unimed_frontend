# CLMF Hub - CSS Design System Export

Este diretório contém a exportação do sistema de design visual do projeto **CLMF Hub** para que possa ser facilmente importado e reutilizado em outro projeto.

---

## Conteúdo do Pacote

1. **[design-system.css](file:///c:/dev/clmf_hub_basic/frontend/export_css/design-system.css)**:
   * Contém as variáveis CSS nativas (`:root`), resets básicos do corpo da página, classes utilitárias para painéis de vidro (glassmorphism), estilos universais de botões, inputs, tabelas e o layout estrutural padrão (sidebar e container principal).
2. **[tailwind-theme.js](file:///c:/dev/clmf_hub_basic/frontend/export_css/tailwind-theme.js)**:
   * Objeto Javascript contendo a definição da paleta de cores estendida. Ideal para ser copiado e colado dentro da propriedade `theme.extend.colors` do arquivo `tailwind.config.js` do seu novo projeto.

---

## Como Utilizar

### 1. Usando CSS Puro / Sem Tailwind

Se o seu outro projeto não utilizar Tailwind CSS, basta copiar o arquivo `design-system.css` para a pasta de assets/estilos do seu projeto e importá-lo no arquivo principal (geralmente `index.js`, `main.js` ou no `index.html`):

```html
<link rel="stylesheet" href="caminho/para/design-system.css">
```

Você terá acesso a todas as classes como `.glass-panel`, `.btn`, `.btn-primary`, `.app-container`, `.sidebar` e os resets de inputs/tabelas estruturados.

### 2. Usando com Tailwind CSS

Se o seu novo projeto utilizar Tailwind CSS, você pode importar as definições de cores para manter o mesmo esquema visual dark premium:

1. Abra o arquivo `tailwind-theme.js`.
2. Cole a propriedade `colors` dentro do bloco `theme.extend` do seu `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // slate-900
        surface: '#1e293b',    // slate-800
        primary: {
          DEFAULT: '#3b82f6',  // blue-500
          hover: '#2563eb',    // blue-600
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#64748b',  // slate-500
          hover: '#475569',    // slate-600
          foreground: '#ffffff'
        },
        success: '#10b981',    // emerald-500
        error: '#ef4444',      // red-500
        text: {
          primary: '#f8fafc',  // slate-50
          secondary: '#94a3b8',// slate-400
        },
        border: '#334155',     // slate-700
      }
    },
  },
  plugins: [],
}
```

3. Importe também as regras utilitárias de layout e o glassmorphism copiando as classes do `design-system.css` para o seu arquivo de CSS global (ex: `index.css`).

---

## Resumo dos Tokens de Design

* **Paleta de Cores Primária:** Dark Mode Premium baseada na escala Slate/Zinc do Tailwind.
* **Cor de Destaque (Accent):** Azul vibrante (`#3b82f6`) com sombras de brilho suaves (`var(--accent-glow)`).
* **Bordas e Elementos Separadores:** Slate-700 (`#334155`) para garantir uma divisória harmônica e de baixo contraste nos tons escuros.
* **Efeito Glassmorphism:** Fundo translúcido com desfoque de `12px` (`backdrop-filter`) e borda sutil, simulando um vidro fume.
