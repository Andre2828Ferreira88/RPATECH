# RPAWorks — Performance Fix: GSAP + ScrollTrigger

## Causa do lag (por ordem de impacto)

### 1. [CRÍTICO] `filter: blur()` animado em múltiplos elementos simultaneamente
**Onde:** `script.js` — seção de serviços (SV section) e `scroll-story.js`  
Blur é renderizado pelo GPU mas força uma etapa extra de compositing para cada layer.
Quando `blur(16px)` → `blur(0px)` é animado em 4 cards × ~5 innerItems + título + subtítulo
ao mesmo tempo, a GPU precisa compor 15–20 layers com blur simultaneamente. Isso sozinho
derruba de 60fps para 20–30fps em GPUs integradas.

### 2. [CRÍTICO] `filter: brightness() + saturate()` animado no hero inteiro via scrub
**Onde:** `script.js` — bloco `initRpaWorksFixedHeroCover`  
Animar `filter` em um elemento grande (hero full-viewport) durante o scroll com `scrub` é
especialmente pesado porque cada frame de scroll dispara uma operação de filtro em toda a área.

### 3. [ALTO] Canvas (scroll-story) rodando a 60fps sem limitação
**Onde:** `scroll-story.js`  
O `requestAnimationFrame(draw)` rodava em 60fps constantes com 6 orbs + 22–55 partículas.
Isso acontecia **ao mesmo tempo** que o GSAP do hero cover e o portfolio estavam ativos.

### 4. [MÉDIO] Parallax de imagens rodando a cada frame de scroll do portfólio
**Onde:** `portfolio-horizontal-fix.js` — função `setUI()`  
A cada frame de rAF durante o scroll horizontal, o código calculava `getBoundingClientRect()`
para **todas** as imagens dos cards e setava `img.style.transform`. Layout thrashing + repaints.

### 5. [MÉDIO] `setup()` do hero cover chamando `ST.refresh()` imediatamente
**Onde:** `script.js` linha ~2823  
`ST.refresh()` dentro do `setup()` fazia o ScrollTrigger recalcular todos os triggers
antes do DOM estar completamente estabilizado. Agora só no `window.load` e no resize.

### 6. [BAIXO] `will-change: transform, opacity, filter` em cards
**Onde:** `style.css`  
`will-change: filter` promove o elemento para sua própria layer de composição mas não
garante que o `filter` seja acelerado por GPU. Removida a propriedade `filter` do `will-change`.

---

## Arquivos modificados

| Arquivo | O que mudou |
|---|---|
| `script.js` | Removidos `filter:blur()` de todas animações GSAP da SV section; removido `filter:brightness/saturate` do hero cover scrub; `ST.refresh()` movido para fora do `setup()` |
| `scroll-story.js` | FPS limitado a 28fps mobile / 50fps desktop; orbs: 6→4; removidos todos `filter:blur()` das animações GSAP |
| `portfolio-horizontal-fix.js` | Removido parallax de imagens durante scroll; removidos `setTimeout(setup)` redundantes |
| `style.css` | `will-change: filter` removido; `backdrop-filter: blur(18px)` dos story panels → `blur(12px)`; adicionado bloco de perf CSS com `backface-visibility: hidden`, `reduced-motion` e desativação de animações de fundo no mobile |

---

## O que foi mantido sem alteração

- Todas as animações de entrada (só removido o blur, mantido y/opacity/scale/rotateX)
- Hero cover: scale + y + dim/vignette overlay (só removido o filter)  
- Portfolio horizontal: pin, scroll, contador, hover 3D
- scroll-story: toda a lógica de painéis, canvas, cores, GSAP timeline
- Navbar, footer, WhatsApp, chatbot, planos, depoimentos, FAQ, contato
- Scripts de tracking (GTM/GA)

---

## Como testar a melhoria

1. Abrir Chrome DevTools → Performance → gravar 5 segundos de scroll
2. Antes: quedas de FPS para 20–30fps durante scroll pela SV section e portfólio
3. Depois: FPS mais estável, menos "Long Tasks" na timeline
4. Verificar no DevTools → Rendering → "Paint flashing": menos flashes verdes
5. Verificar `Layers` panel: ausência de layers com `filter` ativas no scroll

## Como protegeu o mobile

- Canvas limita FPS a 28fps no mobile (`window.innerWidth <= 768`)
- hero-bg e hero-particles: `animation: none` no mobile via CSS
- Parallax de imagens: já estava desativado no mobile (novo fix reforça)
- `@media (prefers-reduced-motion)` desativa todas as animações CSS
