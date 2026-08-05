# DESIGN.md - Design System & UI/UX Guidelines (OfertaHub)

> **Propósito**: Garantir consistência visual, usabilidade responsiva e estética de alta qualidade para todas as páginas, formulários, tabelas, modais e componentes da aplicação OfertaHub.

---

## 1. Visão Geral e Princípios de Design

1. **Dashboard SaaS Premium**: Visual limpo, tecnológico, moderno e de carregamento ultra-rápido.
2. **Identidade Própria**: Não copiar a identidade visual dos marketplaces (Mercado Livre, Shopee, Amazon). Mostrar apenas o nome ou logo discreto da origem da oferta.
3. **Contraste & Clareza**: Leitura confortável com tipografia legível, espaçamentos generosos e hierarquia de informação clara.
4. **Respostas Instantâneas (Feedback Continuo)**: Todo clique, salvamento ou alteração deve refletir feedback visual (Skeletons, Spinners, Toasts, Tooltips e Badges de status).
5. **Dark Mode & Light Mode**: Suporte nativo e alternável sem quebrar o contraste de cores das ofertas.

---

## 2. Paleta de Cores e Tokens Visuais

### Modo Claro (Default)
- **Fundo Principal (Background)**: `#F8FAFC` (Slate 50) - Fundo neutro e suave.
- **Superfície de Cards/Painéis**: `#FFFFFF` (White) com bordas finas `#E2E8F0` (Slate 200).
- **Cor Primária (Accent / Highlights)**: Laranja / Âmbar vibrante
  - Base Primary: `#F59E0B` (Amber 500)
  - Hover Primary: `#D97706` (Amber 600)
  - Gradient Primary: `linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)`
- **Cor Secundária (Texto & Elementos Estruturais)**:
  - Dark Slate Base: `#0F172A` (Slate 900)
  - Sidebar Fundo: `#0F172A` (Slate 900) ou `#1E293B` (Slate 800)
  - Texto Principal: `#1E293B` (Slate 800)
  - Texto Secundário / Muted: `#64748B` (Slate 500)

### Modo Escuro (Dark Mode)
- **Fundo Principal (Background)**: `#020617` (Slate 950)
- **Superfície de Cards/Painéis**: `#0F172A` (Slate 900) com bordas finas `#1E293B` (Slate 800)
- **Texto Principal**: `#F8FAFC` (Slate 50)
- **Texto Secundário / Muted**: `#94A3B8` (Slate 400)

### Semântica de Status e Qualidade
- **Qualidade da Oferta (Score)**:
  - 🟢 **Excelente (Score >= 80)**: Badge Verde (`#10B981` bg-emerald-500/10 text-emerald-600)
  - 🟡 **Boa (Score 50 - 79)**: Badge Amarelo/Âmbar (`#F59E0B` bg-amber-500/10 text-amber-600)
  - 🔴 **Fraca (Score < 50)**: Badge Vermelho (`#EF4444` bg-rose-500/10 text-rose-600)
- **Link de Afiliado**:
  - 🔵 **Pendente de Conversão**: Badge Azul (`#3B82F6` bg-blue-500/10 text-blue-600)
  - 🟢 **Configurado / Validado**: Badge Verde (`#10B981`)
  - 🔴 **Com Erro / Expirado**: Badge Vermelho (`#EF4444`)
- **Status do Funil de Oferta**:
  - `Encontrada`: Gray Slate
  - `Em análise`: Indigo
  - `Aprovada`: Teal
  - `Aguardando Link`: Amber/Orange
  - `Pronta para Divulgar`: Emerald
  - `Publicada`: Blue
  - `Expirada`: Rose

---

## 3. Tipografia e Iconografia

- **Família Tipográfica**: `Inter`, `Plus Jakarta Sans` ou `system-ui, sans-serif`.
- **Tamanhos e Pesos**:
  - **H1 (Títulos de Páginas)**: `text-2xl` / `text-3xl` (font-bold, tracking-tight)
  - **H2 (Seções de Cards)**: `text-lg` / `text-xl` (font-semibold)
  - **H3 (Subtítulos e Headers de Tabelas)**: `text-sm` (font-semibold, text-muted)
  - **Body (Texto Geral)**: `text-sm` (font-normal, leading-relaxed)
  - **Captions e Labels Técnicas**: `text-xs` (font-medium, text-muted-foreground)
- **Ícones**: Utilizar **Lucide Icons** (`lucide-react`) com traços uniformes (`stroke-width: 1.75px` ou `2px`).

---

## 4. Componentes e Padrões de Interface

### 4.1. Layout Base (Shell)
- **Sidebar**:
  - Recolhível (toggle expand/collapse).
  - Escura (Dark Slate `#0F172A`) com contraste perfeito para o logo e links.
  - Ícone + Label com estado ativo iluminado com gradiente primário (`amber-500`).
- **Header**:
  - Fundo translúcido com `backdrop-blur-md`.
  - Campo de **Busca Global** centralizado (`Ctrl + K`).
  - Seletor de Workspace ativo no topo esquerdo.
  - Alternador de tema (Claro/Escuro), Notificações e Avatar do Usuário no lado direito.

### 4.2. Formulários e Inputs
- **Estrutura**: Todos os formulários devem usar `react-hook-form` + `zod`.
- **Estilo de Inputs**:
  - Borda limpa (`border border-slate-300 dark:border-slate-700`).
  - Foco com anel Âmbar suave (`focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`).
  - **Labels**: `text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block`.
  - **Mensagens de Erro**: Texto em vermelho pequeno sob o campo com ícone `AlertCircle`.
  - **Tooltips**: Adicionar `Tooltip` da biblioteca shadcn em campos técnicos (ex: *Domain ID*, *External Category ID*, *Tag de Rastreamento*).

### 4.3. Tabelas de Dados e Grids
- **Header de Tabela**: Fundo suave (`bg-slate-100/70 dark:bg-slate-800/50`), texto minúsculo e uppercase (`text-xs font-medium text-slate-500 uppercase tracking-wider`).
- **Linhas**:
  - `hover:bg-slate-50 dark:hover:bg-slate-800/40` com transição suave.
  - Linhas ímpares com leve alteração de tom em tabelas extensas.
- **Ações em Massa**: Quando 1 ou mais itens forem selecionados (checkbox), exibir uma **Barra Flutuante de Ações** na parte inferior com botões: *Aprovar*, *Ignorar*, *Alterar Categoria*, *Marcar Expirada*, *Exportar CSV*.

### 4.4. Cards de Produtos e Ofertas
- **Visão em Card**:
  - Imagem do produto no topo com proporção `aspect-square` ou `16:9`, com overlay discreto do Marketplace (ex: badge "Mercado Livre").
  - Nome do produto truncated em no máximo 2 linhas (`line-clamp-2 font-medium`).
  - Bloco de Preço:
    - Preço Anterior: Riscado e apagado (`text-xs line-through text-slate-400`).
    - Preço Atual: Destaque em negrito (`text-lg font-bold text-slate-900 dark:text-white`).
    - Badge de Desconto: Em destaque visual ao lado do preço (`bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-bold rounded-md`).
  - Rodapé do Card: Selo de Qualidade (Score) + Botão de ação principal (*Ver Detalhes* / *Copiar Link* / *Salvar*).

### 4.5. Central de Ofertas (Kanban Board)
- **Colunas do Funil**:
  - Header de cada coluna com contador de ofertas e indicador de cor.
  - Drag-and-drop intuitivo de cards entre fases.
  - Botão de adicionar/salvar oferta rápida no topo.

### 4.6. Criador de Artes (Canvas)
- Proporções pré-definidas com seletor de abas:
  - `Feed (1080x1350)`
  - `Quadrado (1080x1080)`
  - `Stories (1080x1920)`
- Painel esquerdo com controles de customização (Cores, Logos do projeto, Badges de Cupom, Preço em destaque).
- Painel direito com preview em tempo real e botão **Exportar PNG**.

---

## 5. Feedbacks Visuais e Estados de Exceção

1. **Skeletons**: Durante requisições do React Query à API NestJS, nunca mostrar uma tela em branco. Exibir esqueletos pulsantes (`animate-pulse bg-slate-200 dark:bg-slate-800`).
2. **Empty States**: Quando uma busca não retornar resultados ou a lista estiver vazia, exibir:
   - Ícone amigável em tom fosco.
   - Título explícito (ex: "Nenhuma oferta encontrada").
   - Descrição curta orientando o usuário.
   - Botão de ação (ex: "Limpar filtros" ou "Nova Busca").
3. **Toasts**: Notificações flutuantes no canto inferior direito para sucessos (*"Link copiado!"*, *"Cupom salvo com sucesso!"*) ou erros da API NestJS.

---

## 6. Responsividade e Mobile First

- Breakpoints Tailwind:
  - `sm`: 640px
  - `md`: 768px (Sidebar recolhe automaticamente em telas < md)
  - `lg`: 1024px
  - `xl`: 1280px
- Em dispositivos móveis:
  - Navegação principal transiciona para Menu Drawer (Sheet).
  - Tabelas ganham rolagem horizontal fluida ou se transformam em visão de Cards verticais.
  - Ações rápidas (Copiar link, Compartilhar no WhatsApp) com botões grandes e fáceis de tocar.
