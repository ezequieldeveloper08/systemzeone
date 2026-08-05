# Phase 3 Checklist: Buscador de Produtos e Integração Mercado Livre

> Especificação de referência: [.specs/04-product-search-mercadolivre.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/04-product-search-mercadolivre.spec.md)

---

- [ ] `3.1` **Camada de Integração `MarketplaceProvider`**
  - [ ] Definir a interface `MarketplaceProvider` em `site/services/marketplaces/types.ts`.
  - [ ] Implementar `MercadoLivreProvider` consumindo a API oficial do Mercado Livre (`/sites/MLB/search`, `/products/search`, `/items`).
  - [ ] Implementar `ShopeeProvider` (adaptador pronto para Open API).
  - [ ] Implementar `ManualMarketplaceProvider` para inserção sob demanda.
  - [ ] Criar serviço Mock Fallback para funcionamento sem credenciais (modo de demonstração).

- [ ] `3.2` **Página do Buscador de Produtos (`/products`)**
  - [ ] Construir barra de pesquisa e painel de Filtros Avançados (palavra-chave, marketplace, faixa de preço, % desconto mínimo, frete grátis, ordenação).
  - [ ] Implementar visualização em Grid de Cards e em Tabela com alternador visual.
  - [ ] Exibir badges de marketplace, selo de preço anterior vs atual e porcentagem de desconto.
  - [ ] Adicionar botão de ação "Salvar Oferta", "Ver Detalhes" e "Copiar Link Original".

- [ ] `3.3` **Tela de Detalhes do Produto (`/products/[id]`)**
  - [ ] Exibir galeria de imagens, especificações, histórico de preço e métricas de vendas.
  - [ ] Construir Tabela Comparativa de Vendedores/Anúncios vinculados ao produto de catálogo.
  - [ ] Adicionar ação "Escolher Esta Oferta" para salvar no funil de ofertas do workspace.
