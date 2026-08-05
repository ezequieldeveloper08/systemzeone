# Specification 07: Histórico de Publicações e Rastreamento de Cliques

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 1.0  
> **Status**: Aprovado  

---

## 1. Visão Geral

Esta especificação detalha o módulo de histórico de publicações, ações de compartilhamento rápido via links `wa.me` / Telegram e o sistema de telemetria de cliques nos links divulgados.

---

## 2. Histórico de Publicações (`/publications`)

Toda divulgação realizada ou agendada gera um registro na tabela `social_publications`.

### 2.1. Métricas e Atributos Registrados
- **Oferta Relacionada**: Link para a oferta salva.
- **Rede Social**: WhatsApp, Telegram, Instagram, Facebook, X.
- **Conteúdo Utilizado**: Texto e imagem finais.
- **Link Divulgado**: Link de afiliado encurtado ou rastreado.
- **Status**: Rascunho, Agendada, Publicada, Cancelada, Com Erro.
- **Data & Responsável**: Carimbo de data/hora e ID do usuário do workspace.

---

## 3. Botões de Compartilhamento Direto

Para acelerar o trabalho do afiliado, o sistema oferece atalhos diretos sem necessidade de APIs não oficiais:

- **WhatsApp**:
  - Link gerado: `https://wa.me/?text={encoded_message}`.
  - Abre diretamente o WhatsApp Web/App com a mensagem formatada para disparo manual em grupos/canais.
  - Preparado para integração futura com *WhatsApp Cloud API*.
- **Telegram**:
  - Link gerado: `https://t.me/share/url?url={link}&text={text}`.
- **Ações de Cópia Um-Clique**:
  - `[Copiar Legenda]`
  - `[Copiar Link]`
  - `[Copiar Texto + Link]`

---

## 4. Sistema de Rastreamento de Cliques (`click_events`)

Quando um comprador clica em um link de oferta gerado pelo sistema:
1. O endpoint de redirecionamento (`/r/[link_id]`) registra o evento na tabela `click_events` (com origem e timestamp).
2. Incrementa o contador `click_count` na tabela `affiliate_links`.
3. Redireciona o usuário para o destino final (`affiliate_url` ou `original_url`).
