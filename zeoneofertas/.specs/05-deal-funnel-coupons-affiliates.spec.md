# Specification 05: Central de Ofertas, Algoritmo de Score, Links de Afiliado e Cupons

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 1.0  
> **Status**: Aprovado  

---

## 1. Central de Ofertas (`/offers`)

A Central de Ofertas gerencia o ciclo de vida de cada promoção identificada no workspace através de um funil de 8 etapas.

### 1.1. Estágios do Funil (`offer_status`)
1. **Encontrada**: Oferta capturada na busca ou inserida manualmente.
2. **Em análise**: Oferta sendo verificada pela equipe/afiliado.
3. **Aprovada**: Oferta validada e considerada atrativa.
4. **Aguardando link de afiliado**: Oferta aprovada pendente da conversão do link no portal do afiliado.
5. **Pronta para divulgar**: Link de afiliado inserido e cupom associado.
6. **Publicada**: Oferta disparada nos canais de transmissão.
7. **Expirada**: Preço alterado ou estoque esgotado.
8. **Ignorada**: Descartada por baixa qualidade ou indisponibilidade.

### 1.2. Modos de Visualização
- **Kanban**: Drag-and-drop entre colunas com resumo de desconto e atalhos rápidos.
- **Tabela**: Visão densa com ordenação multi-coluna e **Ações em Massa** (Aprovar, Ignorar, Alterar Categoria, Exportar CSV).
- **Cards Grid**: Cards focados em imagem e métricas visuais.

---

## 2. Algoritmo de Cálculo de Score da Oferta

Cada oferta possui um **Score dinâmico (0 a 100)** para priorização automática:

### Fórmula de Pontuação:
- **Desconto (%) (Até 40 pts)**: `min(discountPercentage * 0.8, 40)`
- **Frete Grátis (15 pts)**: `+15` se `free_shipping = true`
- **Volume de Vendas (Até 15 pts)**:
  - `>= 1000 vendas`: +15 pts
  - `>= 100 vendas`: +10 pts
  - `>= 10 vendas`: +5 pts
- **Possui Cupom de Desconto Ativo (15 pts)**: `+15` se houver cupom associado
- **Link de Afiliado Configurado (15 pts)**: `+15` se houver `affiliate_url` validado

### Classificação Visual (Selo de Qualidade):
- **Score >= 80**: 🟢 **Oferta Excelente** (Selo Emerald)
- **Score 50 a 79**: 🟡 **Oferta Boa** (Selo Amber)
- **Score < 50**: 🔴 **Oferta Fraca** (Selo Rose)

---

## 3. Central de Links de Afiliado (`/affiliate-links`)

### 3.1. Tratamento para Mercado Livre
- Exibe o **Link Original** do anúncio.
- Oferece o botão **"Copiar link para converter"**.
- Exibe instrução orientando o usuário a colar o link no Portal de Afiliados Oficial Mercado Livre.
- Disponibiliza o campo **"Cole seu Link de Afiliado"** e o botão **"Salvar e Validar"**.
- NUNCA tenta inventar ou gerar parâmetros de afiliado sintéticos sem validação.

---

## 4. Central de Cupons Gerais (`/coupons`)

### 4.1. Cadastro e Campos
- **Código**: Ex: `CUPOM10`, `TECH100`.
- **Marketplace**: Mercado Livre, Shopee, Amazon, etc.
- **Tipo de Desconto**: Porcentagem (%) ou Valor Fixo (R$).
- **Regras**: Compra mínima, desconto máximo, data de expiração.
- **Origem**: Cadastrado manualmente, Importado por CSV, Portal de Afiliado.

### 4.2. Recursos Especiais
- **Importação/Exportação CSV**: Upload de listas massivas de cupons.
- **Alerta de Expiração**: Destaque visual em cupons com validade menor que 24 horas.
- **Associação com Ofertas**: Vinculação de 1 cupom a N ofertas salvas.
