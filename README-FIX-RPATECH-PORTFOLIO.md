# Fix: Portfolio Horizontal Scroll — RPATECH

## Bug encontrado

Três implementações conflitantes rodavam simultaneamente sobre a mesma seção, brigando pelo controle do `transform` do `.portfolio-track`:

**Implementação 1** — `script.js` linhas 2843–3072 (`Portfolio Section — Horizontal Sticky Showcase DEFINITIVE`)
- Usava `ScrollTrigger.create()` **sem `pin: true`**
- Sem `pin`, o ScrollTrigger apenas chamava `onUpdate` enquanto a section estava visível, mas **a página continuava rolando normalmente** — por isso a section liberava cedo
- O `killOldPortfolioTriggers()` interno não eliminava completamente os outros listeners

**Implementação 2** — `script.js` linhas 3074–3237 (`PORTFÓLIO MOVIMENTO HORIZONTAL MANUAL OVERRIDE`)
- Usava `window.scroll` + `rAF` + `getBoundingClientRect()`
- Sobrescrevia o `transform` com `setProperty(..., 'important')` em conflito com a implementação 1
- Rodava com `setTimeout(setup, 1000)` medindo depois que a implementação 1 já tinha movido o track, contaminando o `scrollWidth`

**Implementação 3** — `portfolio-horizontal-fix.js`
- Terceira tentativa de correção, também com `window.scroll` + `rAF`
- Também usava `setProperty('transform', ..., 'important')`
- As três brigavam em sequência, resultando na seção liberando antes de todos os cards aparecerem

**Bug adicional no CSS** — `--portfolio-scroll-height` com valores fixos (`2600px` e `2200px`) declarados diretamente na regra `#portfolio.portfolio-section`, sobrescrevendo o valor calculado pelo JS antes de ele rodar.

## Arquivos modificados

| Arquivo | O que mudou |
|---|---|
| `script.js` | Removidas as linhas 2843–3237 (dois blocos de portfolio conflitantes) |
| `portfolio-horizontal-fix.js` | Reescrito do zero como implementação única e limpa |
| `style.css` | Removidos os dois valores fixos `--portfolio-scroll-height: 2600px` e `2200px` das regras base (mantido apenas o fallback no bloco `.portfolio-horizontal-ready`) |

## Seletor real do portfólio

```
section: #portfolio.portfolio-section
pin:      #portfolio .portfolio-pin        (position: sticky)
viewport: #portfolio .portfolio-viewport   (overflow: hidden)
track:    #portfolio .portfolio-track      (width: max-content; display: flex)
cards:    #portfolio .portfolio-card       (flex: 0 0 auto)
```

## Como o ScrollTrigger foi corrigido

A abordagem com `ScrollTrigger.create()` sem `pin: true` foi **removida completamente**. O pin visual é feito por **CSS puro** (`.portfolio-pin { position: sticky; top: var(--portfolio-sticky-top) }`), que é mais confiável e não conflita com outros ScrollTriggers da página (seção de serviços, etc.).

O movimento horizontal é calculado via `getBoundingClientRect()` a cada frame:

```js
var rect     = section.getBoundingClientRect();
var scrolled = -(rect.top) - topbarH;   // pixels rolados dentro da section
var progress = clamp(scrolled / scrollRange);  // 0..1
var x        = -(distance * progress);          // translateX em pixels
```

O `scrollRange` é exatamente igual a `distance` (pixels horizontais do track), garantindo que:
- Quando o primeiro card está visível → `progress = 0`, `x = 0`
- Quando o último card está visível → `progress = 1`, `x = -distance`
- A section só libera **depois** de `stickyH + distance + breath` pixels de scroll

## Como o mobile foi protegido

No breakpoint `≤ 768px`:
- A função `measure()` detecta `isMobile()` e remove todas as propriedades CSS calculadas
- Remove a classe `portfolio-horizontal-ready` para que o CSS mobile (scroll nativo) entre em ação
- O `.portfolio-viewport` no mobile tem `overflow-x: auto` + `scroll-snap-type: x mandatory`
- O contador e barra de progresso são atualizados pelo evento `scroll` nativo do viewport

## O que foi preservado sem alteração

- Hero, navbar, footer — intocados
- Seção de serviços (`.sv-section`) com GSAP — intocada
- Scroll Story section — intocada
- Todo o visual do portfólio (cards, imagens, tipografia, cores) — intacto
- Efeito hover 3D / magnetic nos cards — preservado
- `portfolio-catalog.js` e `portfolio-catalog.css` — intocados
- Todas as outras seções — intocadas
