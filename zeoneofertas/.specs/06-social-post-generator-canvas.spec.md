# Specification 06: Gerador de Publicações Sociais e Criador Visual de Artes (Canvas)

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 1.0  
> **Status**: Aprovado  

---

## 1. Visão Geral

Esta especificação aborda duas ferramentas de criação de conteúdo promocional do OfertaHub: o **Gerador de Textos de Divulgação** (com suporte a múltiplos canais, tons e variáveis) e o **Criador de Artes Gráficas** (Canvas HTML5 para exportação em imagem PNG).

---

## 2. Gerador de Textos de Divulgação (`/generator`)

### 2.1. Variáveis Suportadas nos Modelos
- `{nome_do_produto}`: Título completo ou resumido do produto.
- `{preco_atual}`: Preço formatado (ex: `R$ 299,00`).
- `{preco_original}`: Preço anterior formatado (ex: `R$ 499,00`).
- `{percentual_desconto}`: Desconto formatado (ex: `40% OFF`).
- `{cupom}`: Código do cupom associado (ou omite se não houver).
- `{informacao_frete}`: Ex: `Frete Grátis` ou `Consulte o frete`.
- `{link_afiliado}`: URL encurtada ou final de afiliado.

### 2.2. Opções de Personalização
- **Redes Sociais Target**: WhatsApp, Telegram, Instagram (Feed/Stories), Facebook, X (Twitter).
- **Tom de Comunicação**:
  - *Urgente*: Focus em poucas unidades, "Últimas Horas!", emojis de fogo 🔥.
  - *Descontraído*: Linguagem leve, gírias amigáveis, tom informal.
  - *Profissional*: Focus nas especificações do produto e custo-benefício.
  - *Minimalista*: Apenas título, preço e link.
- **Controles Rápidos**:
  - Toggle "Incluir / Remover Emojis".
  - Gerador automático de Legenda Curta, Título Chamativo e Hashtags relevantes.

---

## 3. Criador Visual de Artes em Canvas (`/canvas`)

### 3.1. Formatos e Dimensões
- **Feed Instagram**: `1080 x 1350 px` (Proporção 4:5)
- **Quadrado / WhatsApp**: `1080 x 1080 px` (Proporção 1:1)
- **Stories / Reele**: `1080 x 1920 px` (Proporção 9:16)

### 3.2. Elementos Gráficos Personalizáveis
- Image principal do produto (com remoção de fundo ou moldura limpa).
- Header com logo do workspace/canal do usuário.
- Badge de Desconto em destaque visual (`bg-amber-500` ou `bg-emerald-500`).
- Bloco de preço (De R$ X Por R$ Y).
- Tag discreta com a origem (ex: *"Oferta no Mercado Livre"* - sem violar direitos autorais).
- Seletor de cores da identidade visual do usuário.

### 3.3. Exportação
- Renderização via Canvas HTML5 ou `html2canvas`.
- Download instantâneo do arquivo `.png` em alta resolução.
