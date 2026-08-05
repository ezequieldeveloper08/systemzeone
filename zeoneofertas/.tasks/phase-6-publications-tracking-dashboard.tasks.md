# Phase 6 Checklist: Histórico de Publicações, Telemetria e Dashboard KPI

> Especificações de referência: [.specs/01-overview-architecture.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/01-overview-architecture.spec.md), [.specs/07-publications-tracking.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/07-publications-tracking.spec.md)

---

- [ ] `6.1` **Histórico de Publicações e Botões de Ação (`/publications`)**
  - [ ] Criar tabela e cards de histórico de publicações (`social_publications`).
  - [ ] Implementar botões de compartilhamento direto:
    - [ ] `wa.me` com mensagem codificada para disparo manual no WhatsApp.
    - [ ] Telegram `t.me/share`.
  - [ ] Permitir marcar publicações manualmente como "Realizada".

- [ ] `6.2` **Sistema de Rastreamento de Cliques (`click_events`)**
  - [ ] Criar rota de redirecionamento `/r/[link_id]` para registrar o evento de clique.
  - [ ] Incrementar `click_count` na tabela `affiliate_links`.

- [ ] `6.3` **Dashboard Principal SaaS (`/dashboard`)**
  - [ ] Implementar cards de métricas KPI (Produtos encontrados hoje, Ofertas salvas, Aguardando link, Cupons ativos, Publicações realizadas, Cliques registrados).
  - [ ] Criar gráficos com Recharts ou Chart.js:
    - [ ] Ofertas encontradas por dia.
    - [ ] Publicações por rede social.
    - [ ] Categorias com mais ofertas.
  - [ ] Desenvolver o widget de **Ações Pendentes** (Ofertas sem link de afiliado, Ofertas prestes a expirar, Cupons sem validade, Produtos sem imagem).
