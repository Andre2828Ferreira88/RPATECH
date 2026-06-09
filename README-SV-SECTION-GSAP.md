# SV Section — GSAP + ScrollTrigger

Atualização cirúrgica aplicada somente na section `.sv-section#servicos`.

## Arquivos alterados

- `index.html`: adição do GSAP 3.13 e ScrollTrigger antes do `script.js`.
- `style.css`: CSS isolado apenas para suporte de animação dentro de `.sv-section#servicos`.
- `script.js`: função isolada de animação `initSvSectionAnimations()`.

## O que foi aplicado

- Título com máscara vertical por linha.
- Eyebrow e subtítulo com fade, blur e movimento suave.
- Cards com entrada em stagger no scroll.
- Conteúdo interno dos cards entrando em sequência.
- Parallax sutil nos visuais dos cards no desktop.
- Fallback automático caso GSAP/ScrollTrigger não carregar.
- Respeito a `prefers-reduced-motion`.

## O que foi preservado

Não foram alterados hero, navbar, portfolio, planos, FAQ, footer, textos, cores, imagens, links, modais, `portfolio-catalog.js`, `portfolio-catalog.css` ou `promo.js`.

## Testes realizados

- Conferência da existência da section `.sv-section#servicos`.
- Conferência de que não houve scripts GSAP duplicados.
- Validação de sintaxe do JavaScript com `node --check script.js`.
- Comparação de arquivos alterados: apenas `index.html`, `style.css`, `script.js` e este README.
