# Phase 5 Checklist: Gerador de Textos Promocionais e Criador de Artes Canvas

> Especificação de referência: [.specs/06-social-post-generator-canvas.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/06-social-post-generator-canvas.spec.md)

---

- [ ] `5.1` **Gerador de Textos Promocionais (`/generator`)**
  - [ ] Implementar motor de substituição de variáveis (`{nome_do_produto}`, `{preco_atual}`, `{cupom}`, `{link_afiliado}`).
  - [ ] Criar templates padrão para WhatsApp, Instagram, Telegram, Stories, Facebook, X.
  - [ ] Adicionar seletores de tom (Urgente, Descontraído, Profissional, Minimalista).
  - [ ] Adicionar toggles "Com Emojis" / "Sem Emojis" e gerador de hashtags / chamadas para ação.
  - [ ] Criar botões de cópia rápida: "Copiar Texto", "Copiar Link", "Copiar Legenda".

- [ ] `5.2` **Criador Visual de Artes em Canvas (`/canvas`)**
  - [ ] Construir editor visual de artes com seletor de proporção (Feed 1080x1350, Quadrado 1080x1080, Stories 1080x1920).
  - [ ] Adicionar controles para personalizar cores de fundo, logo do workspace, preço em destaque e badge de cupom.
  - [ ] Implementar preview em tempo real no Canvas.
  - [ ] Implementar exportação do gráfico como arquivo de imagem `.png` em alta qualidade.
