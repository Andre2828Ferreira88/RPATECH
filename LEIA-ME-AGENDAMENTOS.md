# RPAWorks — Página e demonstração de agendamentos

Atualização sobre o ZIP `RPATECH-main (3).zip` enviado. A raiz correta foi identificada em `RPATECH-main/RPATECH-main/`, onde estão o `index.html` e as demais páginas. Esta entrega acrescenta a oferta para salões de beleza e clínicas de estética sem reconstruir o site.

## Entrega e aplicação

`RPAWorks_Agendamentos_Atualizacao.zip` contém **somente os arquivos novos e modificados**, com os caminhos relativos à raiz do site. Não há uma pasta extra `RPATECH-main` dentro deste ZIP. Extraia o conteúdo na pasta que já contém `index.html`, `site.html`, `reservas.html` e `assets`.

O ZIP não contém `.git`, dependências, imagens adicionais ou arquivos originais inalterados. Os arquivos HTML são completos; não são trechos para montar manualmente.

## Desenvolvimento

Foi criada `agendamentos.html`, com uma composição principal compacta: apresentação comercial, condições de referência, processo de funcionamento, demonstração em duas visões, escopo e contato final.

A identidade reutiliza as variáveis de `rpaworks-ui.css`, Arial/Helvetica, preto institucional, laranja, branco e cinza. Os CTAs comerciais do WhatsApp são verdes. A composição e o fluxo foram desenhados para serviços com duração e profissionais habilitados, em vez de reproduzir o formulário de reservas de grupos.

O produto é o principal elemento visual. Não foram adicionados robôs, emojis, fotos aleatórias, novas imagens de clientes, fontes externas, gráficos decorativos ou animações contínuas. A página não exige React, build, instalação de dependências ou APIs pagas.

## Arquivos criados

| Arquivo | Função |
| --- | --- |
| `agendamentos.html` | Oferta comercial, interface do protótipo, metadados, WhatsApp e escopo. |
| `assets/css/agendamentos.css` | Layout da nova página, agenda, formulários, estados e janelas responsivas. |
| `assets/js/agendamentos-model.js` | Catálogo, profissionais, expediente, geração de horários, validações e registros locais. |
| `assets/js/agendamentos-demo.js` | Visões do cliente e do estabelecimento, disponibilidade, filtros, edição e feedback. |
| `LEIA-ME-AGENDAMENTOS.md` | Este guia. |

## Arquivos modificados

| Arquivo | Alteração delimitada |
| --- | --- |
| `index.html` | Link no menu e uma nova linha de serviço para Agendamentos. Design e conteúdo anteriores preservados; a numeração de Design passa para 05. |
| `site.html` | Somente o link de Agendamentos no menu. |
| `sistemas.html` | Somente o link de Agendamentos no menu. |
| `reservas.html` | Somente o link de Agendamentos no menu. |
| `assets/css/rpaworks-ui.css` | Regras adicionais para acomodar quatro destinos no menu em telas pequenas e intermediárias. |
| `assets/js/rpaworks-analytics.js` | Somente a inclusão da identificação `landing_agendamentos` no mapa de páginas. |
| `sitemap.xml` | Inclusão da nova rota. |

Os modelos, controladores e estilos específicos de Reservas, Home e Sites não foram modificados. Os identificadores de analytics, números de WhatsApp, referências de imagens, portfólio e demais arquivos foram preservados. O cabeçalho pode ocupar duas linhas de navegação em celulares para acomodar a nova página sem cortes.

## Demonstração: visão do cliente

1. Escolha um dos serviços de exemplo. A duração aparece junto ao nome.
2. Escolha um profissional habilitado para esse serviço. O seletor mostra apenas profissionais compatíveis.
3. Selecione a data e consulte a grade de horários.
4. Escolha um horário disponível. Horários ocupados ou passados ficam indisponíveis.
5. Informe somente um nome fictício e clique em **Criar agendamento de teste**.
6. A confirmação mostra o código, serviço, profissional, data, intervalo e status pendente.
7. Clique em **Ver no painel do estabelecimento** para acompanhar o pedido.

Os exemplos começam no próximo dia de atendimento relativo à data do navegador. A data não está fixada em novembro de 2026. É possível escolher o dia atual quando ainda houver expediente e horários futuros disponíveis. Em dias sem atendimento, o botão **Buscar próxima data disponível** procura um dia com horários livres.

## Demonstração: visão do estabelecimento

- Consulte a agenda pelo calendário ou pelo campo de data.
- Combine filtros de profissional e status.
- Abra um agendamento para consultar os detalhes.
- Confirme um pedido pendente ou cancele um agendamento.
- Use **Editar / remarcar** para alterar nome de teste, serviço, profissional, dia, horário ou status.
- Use **Novo agendamento** para cadastrar um registro pelo painel.
- Use **Reiniciar demonstração** para restaurar os exemplos originais.

O calendário conta os registros que correspondem aos filtros atuais. Registros cancelados permanecem no histórico da demonstração e só aparecem nas contagens quando o filtro os inclui. As informações exibidas vêm dos registros locais; não há métricas de faturamento ou resultados inventados.

## Regras reais do ambiente fictício

- Corte e finalização: 60 minutos.
- Manicure: 45 minutos.
- Design de sobrancelhas: 30 minutos.
- Limpeza de pele: 60 minutos.
- Profissional A: corte e sobrancelhas, de segunda a sábado.
- Profissional B: manicure e sobrancelhas, de segunda a sábado.
- Profissional C: limpeza de pele e sobrancelhas, de terça a sábado.
- De segunda a sexta: 09h–12h e 13h–18h.
- Sábado: 09h–13h. Domingo sem expediente.
- A grade avança em intervalos de 15 minutos; cada serviço ocupa toda a sua duração.
- O serviço inteiro precisa caber dentro de um único período de expediente. Ele não atravessa o intervalo de almoço nem o encerramento.
- Pedidos pendentes e confirmados bloqueiam o intervalo para o mesmo profissional.
- Sobreposições parciais também são impedidas, inclusive entre serviços de durações diferentes.
- Outro profissional habilitado pode atender no mesmo horário quando tiver disponibilidade.
- Um atendimento pode começar exatamente quando o anterior termina.
- A remarcação desconsidera apenas o próprio registro e confere os demais novamente.
- Cancelar libera o horário. Reativar um cancelamento exige disponibilidade nova; o horário pode ter sido ocupado por outro pedido.
- Datas passadas e horários que já passaram não podem receber novos pedidos ou remarcações. O relógio é conferido novamente ao salvar.
- O limite demonstrativo de agendamento futuro é de 90 dias, configurável no modelo.
- Registros originais podem ser consultados e cancelados mesmo depois do horário; isso não permite criar ou reativar pedidos no passado.

### Personalizar a configuração

Edite `DEFAULT_CONFIG` no início de `assets/js/agendamentos-model.js`:

- `services`: identificadores, nomes e duração em minutos.
- `professionals`: identificadores, nomes fictícios, especialidades, serviços habilitados e dias de trabalho.
- `hours`: períodos de expediente por dia da semana. `0` é domingo e `6` é sábado.
- `slotStep`: passo da grade em minutos. A duração dos serviços deve ser múltipla dele.
- `bookingDays`: horizonte de agendamento.

O código valida a configuração para evitar períodos sobrepostos, durações inválidas e referências a serviços inexistentes. Os registros de exemplo são reconstruídos conforme a data e a configuração, sem horários aleatórios. O catálogo é predefinido no código: não existe CRUD de serviços/profissionais na interface deste protótipo.

## Limites e recursos intencionalmente não implementados

Este é um **protótipo front-end inteiramente local**, identificado na página. Ele permite testar agendamentos dentro de um ambiente fictício; não cria reservas em estabelecimentos verdadeiros.

Não há backend, banco de dados, autenticação, permissões, sincronização entre abas ou dispositivos, persistência, pagamentos, controle clínico ou prontuários. A demo não solicita telefone, CPF, dados de saúde ou pagamento. Não há integração de mensagens ou contatos de clientes no painel. Os registros ficam na memória da página e são descartados ao recarregar.

IA no atendimento, integração oficial com WhatsApp, lembretes automáticos, pagamentos online, estoque, financeiro, fidelidade, várias unidades, permissões complexas, relatórios avançados e integrações externas são apresentados como recursos avaliados e orçados à parte. Backend, autenticação e sincronização da versão contratada também precisam constar da proposta.

As regras deste protótipo não oferecem bloqueio concorrente entre usuários ou computadores. Uma implantação real precisa validar horários no backend e no banco, inclusive a concorrência de gravação, além das demais definições de escopo.

## Oferta e WhatsApp comercial

Condições apresentadas conforme o briefing:

- Projeto-piloto a partir de **R$ 1.990**.
- Manutenção de referência de **R$ 129/mês**, contratada separadamente da implantação.
- Valores e funcionalidades sujeitos à definição do escopo e aprovação comercial.

Os valores são editados no bloco `.ag-commercial` de `agendamentos.html`. Não foram adicionados desconto, preço anterior ou urgência falsa.

Foi preservado o número comercial **+55 11 96121-9986**, já utilizado no projeto. Os três CTAs da nova página usam links nativos HTTPS `wa.me`, abrem em nova aba e preenchem esta mensagem:

> Olá! Vim pela página da RPAWorks e gostaria de conhecer melhor o sistema de agendamentos para meu salão ou clínica de estética.

Esses links são separados dos controles da demo. Nenhuma ação de agendamento fictício abre ou envia WhatsApp. Os números e mensagens das páginas anteriores foram mantidos.

## Analytics

- A nova página carrega os dois scripts compartilhados existentes uma vez cada.
- Sua identificação é `landing_agendamentos`, inclusive em rotas sem a extensão `.html`.
- Foram preservados Clarity, Google Ads, eventos de clique, deduplicação e UTMs.
- O bloqueio de eventos comerciais dentro de `[data-rpa-demo]` continua intacto. A área da demo e a janela administrativa usam esse atributo.
- Conteúdo da demo e da janela está marcado com `data-clarity-mask` para mascaramento nas gravações.
- Não há novos eventos de lead, venda ou conversão quando um agendamento fictício é criado, confirmado ou cancelado.
- Os campos de GA4 e Meta Pixel continuam vazios em `rpaworks-analytics-config.js`; preencha somente com IDs reais de suas contas quando for configurar esses serviços.
- O rastreamento continua desativado por padrão em `file://`, localhost e redes privadas. O protótipo continua funcionando sem ele.

Exemplo de URL de campanha:

```text
https://www.rpaworks.com.br/agendamentos.html?utm_source=instagram&utm_medium=paid_social&utm_campaign=beleza_novembro_2026&utm_content=video_01
```

Não foi confirmado o recebimento nas contas reais de anúncios/analytics. Regras externas configuradas nas próprias plataformas precisam de verificação após a publicação. Um clique no WhatsApp é apenas um clique, não uma conversa comprovada ou contrato fechado.

## Testes efetivamente realizados

Foram executados 12 testes automatizados do modelo, além de verificações de integração do controlador com um DOM mínimo em Node, sem navegador e sem rede:

| Teste solicitado | Resultado e forma de verificação |
| --- | --- |
| A — Agendamento | Criar, consultar, confirmar e mostrar o registro no painel: passou no modelo e no controlador. |
| B — Conflito | Mesmo horário, sobreposição parcial e durações diferentes: bloqueados no modelo. O controlador exibe o erro sem gravar o conflito. |
| C — Outro profissional | Mesmo intervalo com profissional habilitado diferente: permitido. Serviço incompatível: bloqueado. |
| D — Remarcação | Atualiza registro e agenda, ignora apenas o próprio ID e mantém os demais pedidos: passou. |
| E — Cancelamento | Libera horário e impede reativação quando outro pedido ocupa o intervalo: passou. |
| F — Filtros | Data, profissional e status combinados e estado vazio: passou no modelo e no controlador. |
| G — Reset | Restaura os seis exemplos e remove registros criados; datas relativas e viradas de mês/ano: passou. |
| H — Mobile | Estrutura responsiva, referências ARIA, geometria do título e regras para componentes verificadas. Renderização e uso em aparelhos reais não foram testados. |
| I — Navegação | Referências locais, menu com cinco páginas acessíveis, âncoras, folhas de estilo e scripts: verificados automaticamente. |
| J — Conversão | URLs comerciais e número conferidos; eventos testados com SDKs simulados, preservando a exclusão da demo. Entrega real aos fornecedores e abertura do aplicativo WhatsApp não verificadas. |

Também foram verificados: almoço, encerramento, sábados, domingos, escala dos profissionais, datas/horários passados, atualização do relógio ao salvar, validações, imutabilidade das cópias, tratamento seguro de texto digitado, foco e comandos de teclado no controlador. A sintaxe dos scripts foi conferida com `node --check`.

Uma suíte de regressão de Reservas foi executada contra os arquivos atuais, com relógio de teste controlado. Os testes de analytics cobriram as cinco páginas, UTMs entre páginas, identificação de Agendamentos, deduplicação e bloqueio de cliques da demo. Arquivos originais inalterados foram comparados em bytes com o ZIP enviado. Os corpos das páginas Sites, Sistemas e Reservas só diferem pelo novo link no menu.

**Limitação de validação:** não foi possível executar uma prévia em navegador nesta execução. Não há teste visual automatizado, medição de Lighthouse ou teste real em Android/iPhone. Os testes de DOM não substituem um navegador; o checklist abaixo cobre a revisão manual necessária.

## Testar localmente pelo CMD

Na pasta do clone que já utilizamos:

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-atualizado"
```

```cmd
start "" agendamentos.html
```

O protótipo funciona diretamente em arquivo, sem servidor. Para servir via HTTP, com Python instalado:

```cmd
py -m http.server 8000
```

Abra `http://localhost:8000/agendamentos.html`. Use `Ctrl + C` no CMD para encerrar o servidor.

### Checklist manual de navegador e celular

Revise nas larguras de **320, 375, 390, 430, 768, 1024 e 1440 pixels**:

- Menu, título, CTA principal e CTA final sem cortes ou sobreposição.
- Navegação entre Home, Sites, Sistemas, Reservas e Agendamentos.
- Ausência de rolagem horizontal da página.
- Seletor de serviço atualizando os profissionais habilitados.
- Data passada bloqueada e data sem expediente com mensagem útil.
- Seleção de horário, nome de teste e confirmação clara do pedido pendente.
- Alternância entre as duas visões por toque e teclado; setas esquerda/direita e Home/End nos seletores de visão.
- Detalhes, formulário e janela com foco visível, rolagem vertical quando necessária, fechamento por Esc e retorno do foco.
- Novo agendamento, confirmação, remarcação e cancelamento pelo painel.
- Horário cancelado reaparecendo como disponível na visão do cliente.
- Filtros, calendário de outro mês, estado vazio e reset.
- Botões comerciais abrindo o WhatsApp correto; nenhuma ação da demo enviando mensagem.

## Publicar pelo CMD, Git e Netlify

Baixe `RPAWorks_Agendamentos_Atualizacao.zip` em Downloads. Execute um comando por vez. Se houver erro, pare antes dos próximos.

Entre no clone existente e confira seus trabalhos locais:

```cmd
cd /d "%USERPROFILE%\Downloads\RPATECH-atualizado"
```

```cmd
git status
```

Com seus trabalhos locais já salvos e revisados, atualize o clone:

```cmd
git pull --ff-only origin main
```

Extraia a atualização diretamente na raiz desse clone. Este ZIP não contém `.git`:

```cmd
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\RPAWorks_Agendamentos_Atualizacao.zip' -DestinationPath '%USERPROFILE%\Downloads\RPATECH-atualizado' -Force"
```

Confira e prepare os arquivos:

```cmd
git status
```

```cmd
git add agendamentos.html index.html site.html sistemas.html reservas.html assets/css/agendamentos.css assets/css/rpaworks-ui.css assets/js/agendamentos-model.js assets/js/agendamentos-demo.js assets/js/rpaworks-analytics.js sitemap.xml LEIA-ME-AGENDAMENTOS.md
```

```cmd
git diff --cached --stat
```

```cmd
git commit -m "Adiciona landing page e demonstracao de agendamentos"
```

```cmd
git push origin main
```

Se você já aplicou o ZIP em `OneDrive\Área de Trabalho\RPATECH-main\RPATECH-main`, pode copiar dessa pasta para o clone em vez de executar a extração acima:

```cmd
robocopy "%USERPROFILE%\OneDrive\Área de Trabalho\RPATECH-main\RPATECH-main" "%USERPROFILE%\Downloads\RPATECH-atualizado" /E /XD .git /XF .git /R:2 /W:1
```

Faça essa cópia **antes do `git add`**. Preserve o clone e sua pasta `.git`: a pasta extraída do ZIP original, sozinha, não contém o histórico Git.

Depois do envio, confira o deploy da Netlify e a rota `https://www.rpaworks.com.br/agendamentos.html`. O deploy automático depende da configuração do seu site na Netlify. Esta entrega não realizou commit, push, alterações nas contas de anúncios ou publicação externa.
