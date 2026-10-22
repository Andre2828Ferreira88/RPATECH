# RPAWorks — Reservas e identidade visual

Atualização de 22/10/2026, aplicada sobre o projeto `RPATECH-main(2).zip` enviado nesta conversa.

## O que foi entregue

- `reservas.html`: nova página para restaurantes, buffets e espaços para eventos. Uma única seção principal reúne apresentação, orçamento pelo WhatsApp, condições de referência, demonstração e escopo.
- `index.html`: home redesenhada em preto, laranja e branco, com projetos reais, links para as três soluções e acesso direto à demonstração.
- `site.html` e `sistemas.html`: cabeçalhos e navegação padronizados. A composição da página Sistemas, seus estilos internos, suas imagens e seu conteúdo comercial foram preservados. O fundo externo acompanha o preto das outras páginas. O conteúdo, as imagens e a oferta da página Sites foram mantidos.
- Cabeçalho, tipografia Arial/Helvetica, cantos arredondados, contrastes, botões e paleta alinhados. Verde reservado aos botões do WhatsApp.
- `sitemap.xml`: inclui Sites, Sistemas e Reservas.
- Rastreamento compartilhado: identifica a nova página como `landing_reservas` e ignora as ações internas da demonstração nos eventos comerciais.

Não há emojis, novas bibliotecas, animações contínuas, fontes externas, efeitos de brilho ou fundos tecnológicos artificiais nas páginas novas. Foram reutilizadas três imagens reais do portfólio que já estavam embutidas na home anterior, agora em arquivos WebP reutilizáveis. Nenhum arquivo visual original foi removido, renomeado ou substituído. Os caminhos de imagens de `site.html` e `sistemas.html` foram preservados.

## Como a demonstração funciona

Abra `reservas.html` e clique em **Experimentar a demonstração**.

1. A agenda inicia na data atual do computador/celular. Os exemplos acompanham essa data, inclusive em viradas de mês e ano.
2. Clique em um dia para ver suas solicitações. Altere o turno e o status para filtrar. A busca aceita nome e código e ignora diferenças de acento.
3. Use **Pedidos** e **Ver todas as datas** para consultar outros dias.
4. Clique em **Nova solicitação**, preencha dados fictícios e salve. O novo registro aparece na lista.
5. Abra um pedido para consultar os detalhes. Use **Editar / remarcar**, **Confirmar manualmente** ou **Marcar como cancelada**.
6. **Reiniciar demonstração** restaura os exemplos originais.

As contagens seguem os filtros atuais. Pessoas previstas exclui solicitações canceladas. O calendário mostra a quantidade de solicitações, não a capacidade disponível: a equipe verifica disponibilidade e conflitos manualmente.

Este é um **protótipo comercial interativo no navegador**, identificado como tal na página. Não é um sistema de produção, não foi apresentado como um projeto já implantado em cliente, não tem login ou banco de dados, não recebe reservas de um estabelecimento e não sincroniza dispositivos. Os dados ficam somente na memória da página e são descartados ao recarregar ou fechar. Não há cookies ou armazenamento local de reservas.

Os exemplos não possuem números de telefone inventados. O botão do WhatsApp de um solicitante só aparece quando você informa um telefone válido na edição/cadastro. Para experimentar, use somente um número de teste sob seu controle. Ele abre uma conversa e prepara uma mensagem, sem enviar automaticamente. Esse botão não é um pedido de orçamento da RPAWorks e não gera os eventos comerciais definidos no script compartilhado.

## Escopo comercial informado no print

**Versão inicial:** cadastro de solicitações com nome, contato, data, horário, pessoas e observações; calendário por data/turno; painel com filtros; status manual; edição/remarcação; abertura do WhatsApp do solicitante.

**Fora do pacote inicial:** lembretes e confirmações automáticas pelo WhatsApp; chatbot e inteligência artificial; pagamentos, sinais e reembolsos; integrações com caixa, ERP e outras plataformas; mapa de mesas e regras avançadas de capacidade; gestão de várias unidades e permissões por funcionário. A página comunica que recursos adicionais são avaliados e orçados separadamente.

Preços apresentados conforme o material enviado: **implantação a partir de R$ 2.490** e **manutenção de referência de R$ 149/mês**, sujeitas à definição do escopo e das condições em proposta. A manutenção é identificada separadamente da implantação. Não foi aplicada a promoção da página de Sites ao serviço de Reservas.

Para alterar esses valores e a comunicação comercial, edite o bloco `.offer-note` em `reservas.html`. As funcionalidades adicionais precisam de projeto próprio para serem implementadas; não estão escondidas ou simuladas como recursos já contratados.

## Arquivos alterados e novos

Arquivos existentes modificados:

| Arquivo | Alteração |
| --- | --- |
| `index.html` | Home redesenhada, projetos reais e novos acessos. |
| `site.html` | Cabeçalho e referência ao CSS compartilhado. |
| `sistemas.html` | Cabeçalho, referência ao CSS compartilhado, classe para fundo externo e cor do navegador. |
| `assets/js/rpaworks-analytics.js` | Identificação da página Reservas e exclusão dos cliques internos da demo dos eventos comerciais. |
| `sitemap.xml` | Rotas de Sites, Sistemas e Reservas. |
| `README-REFATORACAO-SITES.md` | Nota apontando para este guia mais recente. |

Arquivos novos:

| Arquivo | Finalidade |
| --- | --- |
| `reservas.html` | Landing page e estrutura da demonstração. |
| `assets/css/rpaworks-ui.css` | Identidade, cabeçalho, navegação, CTAs e rodapé compartilhados. |
| `assets/css/home.css` | Layout responsivo da home. |
| `assets/css/reservas.css` | Layout responsivo da nova página, painel e janelas. |
| `assets/js/reservas-model.js` | Regras e dados fictícios da demonstração. |
| `assets/js/reservas-demo.js` | Interações, calendário, filtros e formulários. |
| `assets/img/previews/nick-tattoo.webp` | Captura existente do projeto Nick Tattoo, otimizada. |
| `assets/img/previews/lex-consultoria.webp` | Captura existente do projeto Lex Consultoria, otimizada. |
| `assets/img/previews/milena-esperandio.webp` | Captura existente do projeto Milena Esperandio, otimizada. |
| `LEIA-ME-RESERVAS.md` | Este guia e comandos de atualização. |

Os demais arquivos do projeto original foram mantidos. Não copie somente os HTMLs: o CSS, os scripts e as imagens de prévia também precisam ser enviados.

## Teste local pelo CMD

Na pasta do repositório, os arquivos podem ser abertos diretamente, pois o protótipo não depende de `fetch`, módulos ou servidor:

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-atualizado"
```

```cmd
start "" reservas.html
```

```cmd
start "" index.html
```

Para testar por HTTP, com Python instalado, use:

```cmd
py -m http.server 8000
```

Abra `http://localhost:8000/reservas.html` em outra janela. Encerre o servidor com `Ctrl + C`.

Confira no celular e no computador: cabeçalho e navegação; leitura dos títulos; botões verdes do WhatsApp; filtros combinados; calendário em outro mês; criar uma solicitação; abrir detalhes; editar data e horário; confirmar e cancelar; testar um filtro sem resultados; reiniciar. Faça também o percurso pelo teclado, inclusive abrir e fechar a janela de detalhes/formulário. Os links para portfólios de clientes foram preservados do projeto original; sua disponibilidade depende dessas hospedagens externas.

Use como referência larguras de 320, 360, 390, 414, 768, 1024 e 1440 pixels. Não há altura fixa nos blocos de texto e os painéis passam para uma coluna nas telas menores. As janelas têm rolagem própria quando necessário.

## Analytics preservado

Os identificadores reais de Clarity e Google Ads continuam em `assets/js/rpaworks-analytics-config.js`, sem alterações. Os campos de GA4 e Meta Pixel continuam vazios para preenchimento com IDs reais. Não foram inventados identificadores nem adicionadas instalações duplicadas.

- A nova página recebe a identificação `landing_reservas`.
- UTMs continuam sendo preservadas entre as páginas na mesma aba por até 24 horas.
- Os botões comerciais mantêm os eventos de clique do WhatsApp. Cliques não representam vendas ou reservas efetivamente confirmadas.
- Ações em elementos `data-rpa-demo` não geram os eventos comerciais do script compartilhado, inclusive o WhatsApp do contato de teste.
- A área da demo e a janela possuem `data-clarity-mask` para mascarar o conteúdo nas gravações. Referência: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking
- O rastreamento continua desativado em `file://`, localhost e redes privadas por padrão. A demo funciona mesmo com rastreadores bloqueados.

Exemplo de URL para o anúncio:

```text
https://www.rpaworks.com.br/reservas.html?utm_source=instagram&utm_medium=paid_social&utm_campaign=reservas_restaurantes&utm_content=video_01
```

Regras adicionais configuradas diretamente nas contas do Google, Meta ou por outras tags não são controladas por esses arquivos. A validação de recebimento de eventos nos painéis das contas deve ser feita após publicar. A configuração da ação legada do Google Ads continua sendo um clique de WhatsApp; nenhuma confirmação de reserva fictícia envia conversão comercial.

## Aplicar a atualização inteiramente pelo CMD

Baixe `RPAWorks_Reservas_Atualizacao.zip` em Downloads. Esse ZIP contém somente os arquivos alterados e novos, com a mesma estrutura do projeto. Execute **um comando por vez**. Se algum caminho não existir ou o Git informar um erro, pare antes dos próximos comandos.

Entre no clone que você utilizou na atualização anterior:

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-atualizado"
```

```cmd
git status
```

Se houver alterações locais suas ainda não salvas no Git, revise-as antes de substituir arquivos. Com a pasta limpa, atualize o clone:

```cmd
git pull --ff-only origin main
```

Extraia o ZIP pelo CMD:

```cmd
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\RPAWorks_Reservas_Atualizacao.zip' -DestinationPath '%USERPROFILE%\Downloads\RPAWorks-reservas-extraido' -Force"
```

Copie os arquivos para o clone, sem substituir sua pasta `.git`:

```cmd
robocopy "%USERPROFILE%\Downloads\RPAWorks-reservas-extraido\RPATECH-main" "%USERPROFILE%\Downloads\RPATECH-atualizado" /E /XD .git /XF .git /R:2 /W:1
```

O Robocopy pode retornar código `1` quando copiou arquivos com sucesso. Confira a coluna **FALHA** no resumo.

```cmd
git status
```

```cmd
git add index.html site.html sistemas.html reservas.html sitemap.xml assets/css/home.css assets/css/rpaworks-ui.css assets/css/reservas.css assets/js/reservas-model.js assets/js/reservas-demo.js assets/js/rpaworks-analytics.js assets/img/previews LEIA-ME-RESERVAS.md README-REFATORACAO-SITES.md
```

```cmd
git diff --cached --stat
```

```cmd
git commit -m "Adiciona demonstracao de reservas e padroniza paginas"
```

```cmd
git push origin main
```

Depois, confira o deploy da Netlify. O endereço novo será `https://www.rpaworks.com.br/reservas.html`. O envio ao GitHub e a publicação não foram executados nesta entrega.

Se precisar de todos os arquivos em outra máquina, use `RPAWorks_Reservas_Projeto_Completo.zip`. Ele contém o projeto completo em `RPATECH-main`, sem histórico Git; para enviar alterações ao GitHub, mantenha o clone existente ou faça um clone novo.

## Verificações realizadas

- Sintaxe dos JavaScripts novos e do analytics compartilhado.
- Regras de cadastro, validação, filtros combinados, edição, status, contagens, reset e datas em mudanças de mês/ano.
- Execução do controlador em um DOM mínimo de teste para criação, detalhes, edição, remarcação, WhatsApp de teste e tratamento seguro de texto digitado.
- Analytics com fornecedores simulados: identificação das quatro páginas, UTMs, deduplicação, cliques comerciais, exclusão da demo e ausência de eventos de venda/lead na confirmação fictícia.
- Estrutura dos quatro HTMLs, IDs, referências a CSS/JS/imagens, âncoras e rotas locais.
- Preservação dos estilos internos e referências de imagens das páginas Sites e Sistemas; preservação dos demais arquivos originais.
- Integridade das imagens WebP e dos dois ZIPs.

Essas verificações não substituem o teste visual em navegadores e aparelhos reais. A prévia em navegador não estava disponível nesta execução; não foram realizados testes visuais automatizados nem medições de Lighthouse. Também não foi verificado o recebimento de dados nas contas reais de analytics ou a abertura do aplicativo WhatsApp em Android/iPhone. Os links nativos HTTPS e o número comercial do projeto foram preservados.
