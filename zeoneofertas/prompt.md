Crie um sistema web SaaS completo chamado provisoriamente “OfertaHub”, voltado para afiliados, criadores de conteúdo e administradores de grupos de ofertas.

OBJETIVO DO SISTEMA

O sistema deve facilitar o processo de:

1. Encontrar produtos em marketplaces.
2. Identificar preços, descontos e possíveis ofertas.
3. Organizar cupons gerais e cupons cadastrados manualmente.
4. Selecionar os melhores produtos.
5. Adicionar ou gerar o link de afiliado correspondente.
6. Criar automaticamente textos para divulgação.
7. Compartilhar ofertas no WhatsApp, Instagram, Facebook, Telegram e outras redes.
8. Acompanhar quais ofertas já foram publicadas.
9. Evitar produtos repetidos, links vencidos e promoções expiradas.

IMPORTANTE

O sistema não deve fingir que existe uma API pública para recursos que não estão disponíveis.

Para Mercado Livre:
- Utilizar a API oficial para pesquisar produtos do catálogo.
- Buscar ofertas e anúncios vinculados aos produtos.
- Obter título, preço, preço original, desconto, imagens, disponibilidade, frete, vendedor e permalink quando disponível.
- O link de afiliado poderá ser informado manualmente pelo usuário.
- Criar uma ação “Copiar link original”.
- Criar um campo “Link de afiliado”.
- Criar um status indicando se o produto ainda precisa ter o link convertido no Portal de Afiliados.
- Cupons gerais devem ser cadastrados manualmente ou importados por arquivo.
- Não utilizar scraping.

Para Shopee:
- Preparar uma integração por meio de um adaptador de marketplace.
- Permitir conexão futura com a Shopee Affiliate Open API.
- Quando configurada, utilizar o link de afiliado retornado pela integração.
- Quando não estiver configurada, permitir cadastro manual da oferta.

ARQUITETURA

Crie o projeto usando:

- React.
- TypeScript.
- Tailwind CSS.
- Componentes reutilizáveis.
- Supabase para autenticação, banco de dados, storage e funções de backend.
- React Query ou solução equivalente para cache e requisições.
- Zod para validações.
- Arquitetura modular e organizada por funcionalidades.

Organização sugerida:

src/
  features/
    auth/
    dashboard/
    marketplaces/
    products/
    offers/
    coupons/
    affiliate-links/
    social-posts/
    publications/
    categories/
    settings/
  components/
  services/
  hooks/
  lib/
  types/

Criar uma camada de integração por marketplace:

interface MarketplaceProvider {
  searchProducts(params): Promise<Product[]>;
  getProductOffers(productId): Promise<MarketplaceOffer[]>;
  getProductDetails(itemId): Promise<ProductDetails>;
  validateAffiliateLink?(url): Promise<boolean>;
}

Implementações iniciais:

- MercadoLivreProvider.
- ShopeeProvider.
- ManualMarketplaceProvider.

DESIGN

Criar uma interface moderna, profissional, rápida e responsiva.

Direção visual:

- Dashboard SaaS premium.
- Visual limpo e tecnológico.
- Não copiar a identidade visual dos marketplaces.
- Fundo claro com áreas em cinza muito suave.
- Cards brancos.
- Cor principal em laranja ou âmbar.
- Cor secundária escura.
- Tipografia moderna.
- Ícones consistentes.
- Excelente visual no desktop e no celular.
- Menu lateral recolhível.
- Cabeçalho com busca global.
- Feedback visual de carregamento, sucesso e erro.
- Skeletons durante carregamentos.
- Empty states bem trabalhados.
- Tooltips nos recursos mais técnicos.
- Suporte a modo claro e escuro.

PÁGINAS

1. LOGIN E CADASTRO

Criar:

- Login.
- Cadastro.
- Recuperação de senha.
- Login social preparado para Google.
- Tela de onboarding.

No onboarding, perguntar:

- Nome do usuário.
- Nome do projeto ou canal de ofertas.
- Marketplaces utilizados.
- Redes sociais utilizadas.
- Categorias de interesse.
- Se trabalha sozinho ou em equipe.

2. DASHBOARD

Exibir:

- Produtos encontrados hoje.
- Ofertas salvas.
- Ofertas aguardando link de afiliado.
- Cupons ativos.
- Publicações realizadas.
- Ofertas expiradas.
- Cliques registrados.
- Marketplaces conectados.
- Gráfico de ofertas encontradas por dia.
- Gráfico de publicações por rede social.
- Categorias com mais ofertas.
- Atalhos para “Buscar produtos”, “Adicionar cupom” e “Criar publicação”.

Criar também uma seção “Ações pendentes”:

- Ofertas sem link de afiliado.
- Ofertas próximas de expirar.
- Produtos sem imagem.
- Cupons sem data de validade.
- Ofertas ainda não divulgadas.

3. BUSCADOR DE PRODUTOS

Criar uma página completa para pesquisar produtos.

Filtros:

- Palavra-chave.
- Marketplace.
- Categoria.
- Domínio.
- Faixa de preço.
- Percentual mínimo de desconto.
- Frete grátis.
- Produto novo ou usado.
- Quantidade mínima vendida.
- Apenas disponíveis.
- Marca.
- Ordenação por maior desconto, menor preço, relevância ou popularidade.

Apresentar os resultados em cards e tabela.

Cada produto deve mostrar:

- Imagem.
- Nome.
- Marketplace.
- Marca.
- Modelo.
- Preço atual.
- Preço anterior.
- Percentual de desconto.
- Quantidade vendida.
- Frete grátis.
- Status.
- Data da última atualização.
- Indicador de qualidade da oferta.

Ações:

- Ver detalhes.
- Salvar oferta.
- Comparar vendedores.
- Copiar link original.
- Abrir no marketplace.
- Adicionar link de afiliado.
- Criar publicação.
- Ignorar produto.
- Adicionar aos favoritos.

4. DETALHES DO PRODUTO

Criar uma tela com:

- Galeria de imagens.
- Título completo.
- Descrição.
- Especificações.
- Marca e modelo.
- Produto de catálogo.
- Histórico de preço.
- Melhor preço encontrado.
- Lista de vendedores e anúncios.
- Frete.
- Estoque.
- Quantidade vendida.
- Data da última sincronização.
- Link original.
- Link de afiliado.
- Cupons relacionados.
- Publicações já realizadas.

Criar tabela de comparação de anúncios:

- Vendedor.
- Preço.
- Preço original.
- Desconto.
- Frete.
- Disponibilidade.
- Link.
- Botão para escolher aquela oferta.

5. CENTRAL DE OFERTAS

Criar um funil com os seguintes status:

- Encontrada.
- Em análise.
- Aprovada.
- Aguardando link de afiliado.
- Pronta para divulgar.
- Publicada.
- Expirada.
- Ignorada.

Permitir visualização em:

- Kanban.
- Tabela.
- Cards.

Filtros:

- Marketplace.
- Categoria.
- Status.
- Data.
- Faixa de desconto.
- Responsável.
- Publicada ou não publicada.

Permitir ações em massa:

- Aprovar.
- Ignorar.
- Alterar categoria.
- Marcar como expirada.
- Gerar textos.
- Exportar.
- Adicionar à fila de publicação.

6. LINKS DE AFILIADO

Criar uma central específica.

Cada registro deve possuir:

- Marketplace.
- Produto.
- Link original.
- Link de afiliado.
- Etiqueta de rastreamento.
- Origem do link.
- Data de criação.
- Última validação.
- Status do link.
- Quantidade de cliques.

Status:

- Pendente.
- Configurado.
- Validado.
- Com erro.
- Expirado.

Para Mercado Livre:

- Mostrar o link original.
- Botão “Copiar link para converter”.
- Campo para colar o link de afiliado.
- Botão “Salvar e validar”.
- Instrução curta informando que a conversão deve ser feita pela ferramenta oficial do afiliado.
- Não tentar criar parâmetros de afiliado inventados.

7. CENTRAL DE CUPONS

Criar cadastro e gerenciamento de cupons gerais.

Campos:

- Código.
- Marketplace.
- Título.
- Descrição.
- Tipo de desconto.
- Valor ou percentual do desconto.
- Compra mínima.
- Desconto máximo.
- Data inicial.
- Data de validade.
- Categorias elegíveis.
- Produtos elegíveis.
- Regras.
- Link da página oficial.
- Origem.
- Status.
- Observações.

Origens:

- Cadastrado manualmente.
- Importado por CSV.
- Portal de afiliado.
- Parceiro.
- API, quando disponível.

Status:

- Rascunho.
- Ativo.
- Próximo de expirar.
- Expirado.
- Não verificado.

Criar:

- Alerta de cupom próximo de expirar.
- Botão para duplicar cupom.
- Importação de CSV.
- Exportação de CSV.
- Associação de cupom a uma ou mais ofertas.
- Página pública opcional com os cupons ativos.

8. GERADOR DE PUBLICAÇÕES

Ao selecionar uma oferta, permitir gerar uma publicação para cada rede.

Informações utilizadas:

- Nome do produto.
- Preço atual.
- Preço original.
- Desconto.
- Cupom.
- Compra mínima.
- Frete.
- Link de afiliado.
- Categoria.
- Tom de comunicação.

Criar modelos de texto para:

- WhatsApp.
- Instagram.
- Stories.
- Facebook.
- Telegram.
- X.
- Descrição curta.
- Descrição completa.

Exemplo de modelo para WhatsApp:

🔥 OFERTA ENCONTRADA!

{nome_do_produto}

De: {preco_original}
Por: {preco_atual}
Desconto: {percentual_desconto}

🎟️ Cupom: {cupom}
📦 {informacao_frete}

👉 Comprar: {link_afiliado}

⚠️ Preço e disponibilidade podem mudar.

Permitir:

- Editar o texto.
- Copiar texto.
- Copiar link.
- Copiar texto e link.
- Escolher emojis.
- Remover emojis.
- Escolher tom profissional, urgente, descontraído ou minimalista.
- Criar várias versões.
- Salvar como modelo.
- Gerar legenda curta.
- Gerar título chamativo.
- Gerar hashtags.
- Gerar chamada para ação.

9. CRIADOR DE ARTES

Criar um editor simples para gerar uma imagem de divulgação.

Formatos:

- Feed 1080x1350.
- Quadrado 1080x1080.
- Stories 1080x1920.
- WhatsApp 1080x1080.

A arte deve permitir:

- Imagem do produto.
- Nome resumido.
- Preço anterior.
- Preço atual.
- Percentual de desconto.
- Cupom.
- Marketplace.
- Identidade visual do usuário.
- Logo do projeto.
- Cor de fundo.
- Templates diferentes.
- Exportar em PNG.

Não utilizar logos de marketplaces de maneira que pareça uma página oficial. Mostrar apenas o nome da origem da oferta de forma discreta.

10. PUBLICAÇÕES

Criar histórico de publicações.

Campos:

- Oferta.
- Rede social.
- Conteúdo utilizado.
- Link divulgado.
- Data da publicação.
- Status.
- Responsável.
- Número de cliques.
- Observações.

Status:

- Rascunho.
- Agendada.
- Publicada.
- Cancelada.
- Com erro.

Permitir marcar uma publicação como realizada manualmente.

Criar botões de compartilhamento:

- Abrir WhatsApp com mensagem pronta.
- Abrir Telegram.
- Copiar legenda.
- Copiar link.
- Copiar tudo.
- Abrir Instagram.
- Abrir Facebook.

Para WhatsApp:

- Utilizar link wa.me para compartilhamento manual.
- Deixar preparada uma integração futura com a WhatsApp Cloud API.
- Não criar funcionalidades de leitura ou envio em grupos pela API oficial.
- Permitir gerar a mensagem para o usuário copiar e publicar manualmente em grupos.

11. CATEGORIAS E FONTES DE BUSCA

Criar categorias internas, por exemplo:

- Eletrônicos.
- Informática.
- Ferramentas.
- Casa e cozinha.
- Eletrodomésticos.
- Automotivo.
- Moda.
- Beleza.
- Infantil.
- Games.
- Esportes.

Cada categoria pode possuir:

- Nome.
- Slug.
- Imagem.
- Palavras-chave.
- Marketplaces.
- IDs de categorias externas.
- Domain IDs.
- Percentual mínimo de desconto.
- Faixa de preço.
- Status.
- Frequência de atualização.

Permitir criar uma configuração como:

{
  "name": "Parafusadeiras",
  "slug": "parafusadeiras",
  "marketplace": "MERCADO_LIVRE",
  "keywords": [
    "parafusadeira",
    "furadeira parafusadeira",
    "parafusadeira de impacto"
  ],
  "externalDomainId": "MLB-ELECTRIC_SCREWDRIVERS_AND_IMPACT_WRENCHES",
  "minimumDiscount": 10,
  "active": true
}

12. BUSCAS SALVAS

Permitir salvar buscas com:

- Nome.
- Palavra-chave.
- Categoria.
- Marketplace.
- Filtros.
- Frequência de atualização.
- Última execução.
- Próxima execução.
- Quantidade encontrada.

Criar botão “Executar agora”.

Criar uma fila de processamento simulada no MVP.

13. CONFIGURAÇÕES

Criar telas para:

- Perfil.
- Empresa ou canal.
- Identidade visual.
- Marketplaces.
- Redes sociais.
- Integrações.
- Modelos de publicação.
- Categorias.
- Usuários e equipe.
- Notificações.

Credenciais de API devem ser armazenadas apenas no backend, nunca no frontend.

Variáveis esperadas:

MERCADO_LIVRE_CLIENT_ID
MERCADO_LIVRE_CLIENT_SECRET
MERCADO_LIVRE_ACCESS_TOKEN
MERCADO_LIVRE_REFRESH_TOKEN

SHOPEE_AFFILIATE_APP_ID
SHOPEE_AFFILIATE_SECRET

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Nunca exibir secrets no navegador ou nos logs.

BANCO DE DADOS

Criar as seguintes tabelas:

profiles
- id
- name
- email
- avatar_url
- created_at

workspaces
- id
- name
- slug
- logo_url
- owner_id
- created_at

workspace_members
- id
- workspace_id
- user_id
- role

marketplace_connections
- id
- workspace_id
- marketplace
- status
- access_token_encrypted
- refresh_token_encrypted
- expires_at
- created_at
- updated_at

categories
- id
- workspace_id
- name
- slug
- image_url
- active

search_sources
- id
- workspace_id
- marketplace
- category_id
- keyword
- external_category_id
- external_domain_id
- minimum_discount
- active
- last_run_at

catalog_products
- id
- marketplace
- external_id
- catalog_product_id
- domain_id
- title
- description
- brand
- model
- image_url
- images
- attributes
- status
- last_synced_at

marketplace_offers
- id
- catalog_product_id
- marketplace
- external_item_id
- seller_id
- seller_name
- price
- original_price
- discount_percentage
- currency
- available_quantity
- sold_quantity
- free_shipping
- product_url
- status
- last_synced_at

saved_offers
- id
- workspace_id
- marketplace_offer_id
- status
- score
- notes
- responsible_user_id
- created_at
- updated_at

affiliate_links
- id
- saved_offer_id
- original_url
- affiliate_url
- tracking_tag
- status
- last_validated_at
- click_count

coupons
- id
- workspace_id
- marketplace
- code
- title
- description
- discount_type
- discount_value
- minimum_purchase
- maximum_discount
- starts_at
- expires_at
- source
- status
- rules
- official_url

coupon_offers
- id
- coupon_id
- saved_offer_id

social_templates
- id
- workspace_id
- name
- network
- content
- active

social_publications
- id
- workspace_id
- saved_offer_id
- network
- content
- affiliate_url
- status
- published_at
- scheduled_at
- responsible_user_id

price_history
- id
- marketplace_offer_id
- price
- original_price
- collected_at

click_events
- id
- affiliate_link_id
- source
- created_at

REGRAS DE NEGÓCIO

1. Calcular desconto somente quando original_price for maior que price.

2. Fórmula:

discountPercentage =
  ((originalPrice - price) / originalPrice) * 100

3. Não considerar como oferta:

- Produto sem preço.
- Produto indisponível.
- Produto com preço atual maior que o anterior.
- Link inválido.
- Produto ignorado pelo usuário.

4. Criar um score de oferta considerando:

- Percentual de desconto.
- Quantidade vendida.
- Frete grátis.
- Disponibilidade.
- Popularidade.
- Existência de cupom.
- Existência de link de afiliado.

5. Exibir um selo:

- Oferta fraca.
- Oferta boa.
- Oferta excelente.

6. Detectar duplicidades por:

- Marketplace.
- External item ID.
- Catalog product ID.
- Link normalizado.

7. Manter histórico de preço para verificar se o desconto é real.

8. Quando um produto ficar indisponível:

- Marcar a oferta como indisponível.
- Não excluir o histórico.
- Avisar nas ações pendentes.

9. Quando o cupom vencer:

- Marcar automaticamente como expirado.
- Remover o cupom de novas publicações.

10. Ao compartilhar uma oferta:

- Dar preferência ao affiliate_url.
- Caso não exista, alertar o usuário antes de utilizar product_url.
- Nunca inventar um link de afiliado.

SEGURANÇA

- Implementar Row Level Security no Supabase.
- Cada workspace só pode acessar seus próprios dados.
- Validar todas as entradas.
- Não expor access tokens no frontend.
- Criar Edge Functions para integrações externas.
- Registrar logs sem armazenar segredos.
- Criar tratamento de refresh token.
- Limitar número de chamadas simultâneas.
- Criar cache de resultados.
- Criar proteção contra duplicidade de sincronização.

MVP

O MVP funcional deve incluir:

1. Autenticação.
2. Dashboard.
3. Busca simulada de produtos.
4. Integração preparada para Mercado Livre.
5. Listagem de produtos.
6. Detalhes do produto.
7. Cadastro e organização de ofertas.
8. Campo para link de afiliado.
9. Cadastro de cupons.
10. Gerador de textos para WhatsApp, Instagram e Telegram.
11. Botões para copiar e compartilhar.
12. Histórico de publicações.
13. Interface responsiva.
14. Dados demonstrativos realistas.

INTEGRAÇÃO MERCADO LIVRE

Criar uma Edge Function ou serviço de backend para:

- Autenticar utilizando access token.
- Renovar token utilizando refresh token.
- Pesquisar produtos.
- Consultar anúncios vinculados a um produto de catálogo.
- Consultar detalhes de um anúncio.
- Normalizar o resultado para o modelo interno.

Não colocar o token diretamente no código.

Criar um modo de demonstração que funcione sem credenciais.

Criar contratos TypeScript para as respostas da API.

Criar tratamento para:

- 401.
- 403.
- 404.
- 429.
- Token expirado.
- Falta de permissão.
- Produto sem ofertas.
- Limite de requisição.

EXPERIÊNCIA DO USUÁRIO

O principal fluxo deve ser:

1. Usuário pesquisa “parafusadeira”.
2. Sistema apresenta os produtos encontrados.
3. Usuário abre um produto.
4. Sistema apresenta os anúncios e preços disponíveis.
5. Usuário escolhe a melhor oferta.
6. Sistema salva a oferta.
7. Usuário adiciona um cupom, quando aplicável.
8. Usuário cola o link de afiliado.
9. Sistema gera uma mensagem para WhatsApp e Instagram.
10. Usuário copia ou compartilha.
11. Sistema registra a publicação.

Criar esse fluxo com o menor número possível de cliques.

DADOS DE DEMONSTRAÇÃO

Criar dados simulados de:

- Parafusadeira DeWalt.
- Furadeira Makita.
- Air fryer.
- Smart TV.
- Smartphone.
- Fone Bluetooth.
- Kit de ferramentas.

Cada exemplo deve ter:

- Imagem.
- Preço atual.
- Preço original.
- Desconto.
- Marketplace.
- Frete.
- Quantidade vendida.
- Status do link de afiliado.
- Cupom opcional.

ENTREGA

Gere:

- Todas as telas.
- Componentes reutilizáveis.
- Rotas.
- Banco de dados.
- Migrations do Supabase.
- Políticas de Row Level Security.
- Dados demonstrativos.
- Hooks.
- Serviços.
- Estados de loading e erro.
- Formulários validados.
- Interface responsiva.
- README explicando a configuração.
- Arquivo .env.example.
- Estrutura pronta para integração real.

Não crie apenas uma landing page. Crie uma aplicação administrativa funcional, navegável e com dados persistidos.