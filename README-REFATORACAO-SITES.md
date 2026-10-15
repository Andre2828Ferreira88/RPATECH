# RPAWorks — atualização da landing page de sites

A atualização parte do ZIP original enviado em 14/10/2026. A página de Sistemas continua com o mesmo HTML visível, CSS, imagens e composição. A home também mantém seu layout.

## O que mudou

- `site.html`: um único hero, comunicação comercial solicitada, fundo preto, detalhes laranja, botões verdes do WhatsApp e composição sem elementos flutuantes ou animações de entrada.
- Tipografia, acabamento arredondado e botões seguem a linguagem de `sistemas.html`, com uma estrutura mais simples para o anúncio de sites.
- O CTA principal aparece após o título e a descrição, antes do portfólio e dos detalhes secundários no celular.
- Foram removidos da página de Sites o robô, o texto de entrega em 48h, a promessa de suporte 24h incluso, os dispositivos inclinados e os recortes de tela.
- O parcelamento é apresentado como pagamento da criação do site. Domínio, hospedagem e suporte dependem do plano e do orçamento.
- O desconto de 10% preserva o prazo que já existia: **31/10/2026 às 23h59min59s, horário de São Paulo**. Depois disso ele fica oculto; não é renovado automaticamente. Com JavaScript desativado, o desconto não é exibido e o WhatsApp continua funcionando.
- Foram recuperados **20 arquivos originais da pasta `assets/img/portfolio/`**, a partir do ZIP anterior do próprio projeto. Os nomes e caminhos foram mantidos; nenhum arquivo presente no ZIP atual foi sobrescrito pela recuperação.
- Microsoft Clarity e Google Ads usam um único carregador por página. A home e Sistemas receberam somente essa alteração técnica.

## Arquivos da atualização

```text
site.html
index.html                               somente inclusão do carregador compartilhado
sistemas.html                            somente inclusão do carregador compartilhado
assets/css/site-landing.css               CSS exclusivo da landing page de sites
assets/js/site-landing.js                 validade da promoção
assets/js/rpaworks-analytics-config.js     identificadores e opções de analytics
assets/js/rpaworks-analytics.js            eventos e atribuição por UTM
assets/img/portfolio/                     20 imagens originais recuperadas
```

As demais páginas, arquivos legados, links e pastas foram preservados. Os scripts antigos de efeitos continuam no projeto para não quebrar possíveis usos futuros, mas **não são carregados pela nova landing page**. Não foram adicionadas bibliotecas, fontes externas ou processamento de animação contínua.

## Imagens e portfólio

Os exemplos são Nick Tattoo, Lex Consultoria e Milena Esperandio, os mesmos projetos que já aparecem na home. As capturas WebP incorporadas são reaproveitadas do `index.html` do ZIP atual; não foram criados clientes ou resultados novos.

O notebook exibe a captura real de Nick Tattoo. O celular apresenta uma pequena galeria de capturas reais do portfólio; ele **não simula uma captura móvel original dos clientes**. Isso está identificado como composição ilustrativa na página.

Os caminhos de imagens externas que já existiam foram preservados, incluindo a imagem de compartilhamento `assets/img/portfolio/rpaworks-thumb.jpg`. As imagens de fallback usam os nomes originais `NickTatto.jpg`, `Lex.png` e `Milena.png`.

Os `<source type="image/webp">` possuem versões leves já incorporadas no HTML, evitando baixar os PNG/JPG grandes em navegadores atuais. Se trocar uma imagem na pasta e quiser que a nova apareça, atualize também o `srcset` do `<source>` correspondente, ou remova esse `<source>` para usar somente o arquivo local de fallback.

Para adicionar uma captura móvel verdadeira, substitua a galeria interna do telefone por um `<picture class="screen-picture screen-picture--mobile">` com o arquivo real. Ajuste `width`, `height` e a proporção CSS para a resolução da captura. A classe opcional usa inicialmente a proporção 390/844; não há imagem móvel fictícia nesse caminho.

## WhatsApp

- Número comercial preservado: **+55 11 96121-9986**.
- Texto do botão principal: **Quero um orçamento para meu site**.
- Mensagem preenchida, igual nos dois CTAs da página:

> Olá! Vim pelo anúncio da RPAWorks e gostaria de solicitar um orçamento para desenvolver um site profissional para minha empresa.

Os botões são links HTTPS `wa.me` normais, sem pop-up por JavaScript, formulário ou espera por analytics. O navegador/aparelho encaminha para o WhatsApp instalado ou sua versão web. O rastreamento não impede a navegação.

## Como testar localmente no Windows

Extraia o projeto e abra o CMD dentro da pasta que contém `site.html`.

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-git"
py -m http.server 8000
```

Se o comando `py` não estiver disponível e você tiver Python instalado, use `python -m http.server 8000`. Também é possível servir essa pasta com o Live Server do VS Code.

Abra:

- http://localhost:8000/site.html
- http://localhost:8000/sistemas.html
- http://localhost:8000/index.html

Confira larguras de 320, 360, 375, 390, 414, 768, 960, 1280 e 1440 pixels nas ferramentas de desenvolvimento. Verifique o título, os dois CTAs, os links do portfólio, ausência de rolagem horizontal e navegação por Tab. Os dispositivos usam o fluxo do layout e as imagens usam `object-fit: contain`, sem cortes.

Confira também no Android/iPhone reais. A navegação visual em navegador e a abertura dos aplicativos em aparelhos físicos precisam ser verificadas no seu ambiente; não foram executadas neste ambiente de edição.

O tracking é desativado por padrão em `file://`, localhost e endereços de rede privada, para não poluir as métricas. Para validar o recebimento dos eventos, publique no seu domínio ou numa URL Netlify e use as ferramentas oficiais de depuração.

## Analytics: configuração e o que está ativo

Edite somente `assets/js/rpaworks-analytics-config.js`.

| Campo | Estado entregue |
| --- | --- |
| `clarityProjectId` | `vm0yrwne22`, preservado do projeto original |
| `googleAdsId` | `AW-17970541017`, preservado |
| `googleAdsWhatsAppSendTo` | ação legada `AW-17970541017/luboCLnQm_0bENnjgvlC`, preservada para cliques |
| `ga4MeasurementId` | vazio: preencher com o ID real da propriedade GA4 |
| `metaPixelId` | vazio: preencher com o ID real do Pixel da Meta |
| `googleAdsConfirmedSaleSendTo` | reservado e vazio; não é disparado pelo frontend |
| `trackLocal` | `false` |

Não havia IDs reais de GA4 ou Meta Pixel nos scripts do ZIP. **Nenhum ID foi inventado e nenhum SDK dessas integrações é iniciado sem o identificador válido.** Para ativá-las, preencha os IDs reais nesse arquivo e publique. Não cole outro snippet em paralelo: o carregador já prepara esses SDKs e evita carregar o mesmo fornecedor duas vezes.

### Clique não é venda

- Clarity: mantém `visita_home`, `visita_landing_site`, `visita_landing_sistemas`, os eventos de botão e `whatsapp_click`.
- GA4, quando configurado: evento personalizado **`whatsapp_click`**, com `page_key`, `cta_id` e UTMs disponíveis.
- Meta Pixel, quando configurado: **`WhatsAppClick`** via `trackCustom`; a visita é registrada como `PageView`.
- Google Ads: mantém a ação legada do clique, uma vez por clique. Identifique essa ação no painel como **clique no WhatsApp**, não como uma venda.

Um clique não confirma envio de mensagem, atendimento, lead qualificado ou contratação. A página não dispara `Lead`, `Purchase`, `generate_lead` ou receita com base nesse clique. Contratação/venda confirmada exige validação em CRM/backend ou registro offline, com uma ação separada. O campo reservado para isso não faz disparos automáticos.

Se já houver regras de eventos em Google Tag Manager, Meta Event Setup ou no painel do Google Ads, confira se elas não repetem o clique automaticamente. Essas configurações externas não estão dentro do ZIP e não foram alteradas. O status de uma conversão como principal/secundária também precisa ser conferido na conta de anúncios.

### Origem dos anúncios com UTM

Exemplo de URL para usar no anúncio:

```text
https://www.rpaworks.com.br/site.html?utm_source=instagram&utm_medium=paid_social&utm_campaign=criacao_sites&utm_content=video_01
```

Para Facebook, use `utm_source=facebook`. Troque campanha e conteúdo pelos nomes das suas campanhas reais.

São lidos apenas `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` e `utm_id`. A atribuição é mantida no `sessionStorage` da aba por até 24 horas, reaproveitada nas outras páginas e substituída quando uma nova UTM válida chega. Se o navegador bloquear o armazenamento, os eventos ainda funcionam com as UTMs da página atual.

Os eventos personalizados não copiam a mensagem do WhatsApp, e-mails, campos digitados ou a URL inteira para os parâmetros de clique. Use somente informações de campanha nos campos UTM.

### Onde consultar

- Microsoft Clarity: https://clarity.microsoft.com — abra o projeto do ID existente; filtre por `pagina_rpaworks` e por evento. Se ele não aparecer na sua conta, entre com a conta administradora ou configure um projeto próprio.
- GA4: Tempo real / DebugView, depois de preencher o ID correto e publicar.
- Meta: ferramenta de teste de eventos do seu Pixel, depois de preencher o ID correto e publicar.
- No console de uma página publicada, `window.RPAAnalytics.getStatus()` informa quais integrações foram habilitadas e a atribuição UTM atual. Em localhost o tracking não é inicializado por padrão.

O código foi testado em simulações sem emitir tráfego artificial para as suas contas. O recebimento real, o acesso aos painéis e as regras externas só podem ser confirmados após publicar e acessar as contas respectivas.

## Comandos Git

Copie a atualização para sua pasta **já clonada** `RPATECH-git`; não substitua a pasta `.git` dela. Se extrair o ZIP completo em outra pasta, use essa pasta como projeto completo, mas confira o repositório antes de publicar.

Execute um comando por vez. Se algum comando der erro, pare nele.

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-git"
git status
git add site.html index.html sistemas.html assets/css/site-landing.css assets/js/site-landing.js assets/js/rpaworks-analytics-config.js assets/js/rpaworks-analytics.js assets/img/portfolio README-REFATORACAO-SITES.md
git diff --cached --stat
git commit -m "Refatora landing page de sites e organiza analytics"
git push origin main
```

Depois confira a conclusão do deploy na Netlify e teste `/site.html` no domínio publicado.

## Validações realizadas

- Estrutura HTML, um único hero, título/subtítulo/CTA solicitados e mensagem WhatsApp exata.
- Links, arquivos locais, dimensões e integridade das imagens; 20 arquivos recuperados nos caminhos originais.
- CSS e conteúdo visível de Sistemas/Home comparados ao ZIP original e preservados.
- Contraste de texto, dimensionamento do cabeçalho entre 280 e 1920 pixels e fluxo sem posicionamento absoluto nos blocos comerciais.
- JavaScript: validade da promoção, fila assíncrona, ausência de SDK duplicado, identificação das três páginas, cliques em ícones/textos, UTM, armazenamento bloqueado, identificação de SDK ausente e isolamento entre fornecedores.
- Um disparo legado do Ads por clique e ausência de eventos de venda gerados a partir do WhatsApp.
- Não houve teste visual em navegador, benchmark real de carregamento nem confirmação de coleta nas contas externas neste ambiente.
