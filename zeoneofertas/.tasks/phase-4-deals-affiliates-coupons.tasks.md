# Phase 4 Checklist: Central de Ofertas, Links de Afiliados e Gestão de Cupons

> Especificação de referência: [.specs/05-deal-funnel-coupons-affiliates.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/05-deal-funnel-coupons-affiliates.spec.md)

---

- [ ] `4.1` **Central de Ofertas (`/offers`)**
  - [ ] Implementar visualização em Kanban Board com 8 swimlanes do funil de status.
  - [ ] Implementar alternador para visualização em Tabela Densa e Cards.
  - [ ] Construir a **Barra de Ações em Massa** para seleção múltipla de ofertas (Aprovar, Ignorar, Mudar Categoria, Exportar CSV).
  - [ ] Implementar o Algoritmo de Cálculo de Score (0-100) e renderização dos Selos de Qualidade (Excelente, Boa, Fraca).

- [ ] `4.2` **Central de Links de Afiliado (`/affiliate-links`)**
  - [ ] Criar interface para listagem de links de ofertas salvas.
  - [ ] Implementar fluxo de Mercado Livre: botão "Copiar link original para converter", aviso descritivo sobre a ferramenta de afiliados oficial e campo "Cole seu Link de Afiliado".
  - [ ] Adicionar status visual do link (Pendente, Configurado, Validado, Expirado) e contador de cliques.

- [ ] `4.3` **Central de Cupons Gerais (`/coupons`)**
  - [ ] Criar formulário de cadastro manual de cupons (código, marketplace, tipo de desconto, valor, regras, validade).
  - [ ] Implementar modal/botão de Importação e Exportação de arquivos CSV.
  - [ ] Criar componente de Alerta de Cupom Próximo de Expirar (< 24h).
  - [ ] Permitir associação rápida de 1 cupom a ofertas salvas.
