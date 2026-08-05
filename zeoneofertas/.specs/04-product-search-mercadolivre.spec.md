# Specification 04: Buscador de Produtos, Mercado Livre e Adaptadores de Marketplace

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 1.0  
> **Status**: Aprovado  

---

## 1. Visão Geral do Buscador de Produtos

O **Buscador de Produtos** é o coração da entrada de dados do OfertaHub. Permite pesquisar produtos no catálogo do Mercado Livre, filtrar anúncios ativos, verificar variações de preço entre vendedores e salvar as melhores ofertas para curadoria.

---

## 2. Filtros de Busca Avançada

A página de busca (`/products`) disponibiliza os seguintes filtros:
- **Palavra-chave**: Busca textual livre.
- **Marketplace**: Mercado Livre, Shopee, Manual, Todos.
- **Categoria**: Seleção por categorias internas ou categorias externas Mercado Livre.
- **Faixa de Preço**: Mínimo e Máximo em R$.
- **Percentual Mínimo de Desconto**: Ex: >= 10%, >= 20%, >= 50%.
- **Frete Grátis**: Toggle Sim/Não.
- **Condição**: Novo / Usado.
- **Quantidade Mínima Vendida**: Ex: >= 50 unidades vendidas.
- **Apenas Disponíveis**: Ocultar ofertas esgotadas.
- **Ordenação**: Maior desconto, menor preço, relevância, maior quantidade vendida.

---

## 3. Integração Mercado Livre (MercadoLivreProvider)

### 3.1. Endpoints Utilizados
1. **Busca Geral de Itens**:
   `GET https://api.mercadolibre.com/sites/MLB/search?q={query}&category={category_id}`
2. **Produtos de Catálogo**:
   `GET https://api.mercadolibre.com/products/search?q={query}`
3. **Anúncios Vinculados a um Produto de Catálogo**:
   `GET https://api.mercadolibre.com/products/{product_id}/items`
4. **Detalhes do Item/Anúncio**:
   `GET https://api.mercadolibre.com/items/{item_id}`

### 3.2. Normalização dos Dados
Cada resposta do Mercado Livre é traduzida para os modelos internos:

```typescript
export interface NormalizedProduct {
  externalId: string;
  catalogProductId?: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl: string;
  images: string[];
  marketplace: 'MERCADO_LIVRE';
  offers: NormalizedOffer[];
}

export interface NormalizedOffer {
  externalItemId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  freeShipping: boolean;
  availableQuantity: number;
  soldQuantity: number;
  productUrl: string;
}
```

### 3.3. Tratamento de Erros e Limite de Taxas (Rate Limit)
- Status **401/403**: Token inválido. Disparar renovação via Refresh Token no backend/Edge Function.
- Status **429 (Too Many Requests)**: Aplicar *Exponential Backoff* e utilizar resultados em cache local.
- Status **404**: Exibir indicador de "Produto ou anúncio não encontrado".

---

## 4. Tabela de Comparação de Vendedores (Tela de Detalhes)

Na tela de Detalhes do Produto (`/products/[id]`), caso o produto seja de catálogo e possua múltiplos vendedores, o sistema renderiza uma tabela comparativa:

| Vendedor | Preço Atual | Preço Original | Desconto | Frete | Estoque | Link Original | Ação |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Loja Oficial DeWalt | R$ 499,00 | R$ 699,00 | 28% OFF | Grátis | 45 un. | [Copiar Link] | `[Escolhar Esta Oferta]` |
| EletroTools ML | R$ 520,00 | R$ 650,00 | 20% OFF | R$ 15,00 | 12 un. | [Copiar Link] | `[Escolhar Esta Oferta]` |

Ao clicar em **`[Escolher Esta Oferta]`**, a oferta é salva na **Central de Ofertas** do workspace.
