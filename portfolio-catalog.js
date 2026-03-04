// =========================================================
//  RPAWorks — Portfolio Catalog Overlay
//  portfolio-catalog.js
// =========================================================

// ── Dados dos projetos ──────────────────────────────────────
// EDITE AQUI para adicionar/remover projetos do catálogo.
// category: "site" | "dashboard" | "rpa"
// url: link para o site real (use "#" enquanto não tem)
// img: caminho da imagem screenshot (paisagem, ideal 1280×720px)
const CAT_PROJECTS = [
  {
    id: 1,
    title: "RPAWorks",
    desc: "Site institucional com design 2026 — landing page de alta conversão com animações, chatbot e integração WhatsApp.",
    category: "site",
    url: "https://rpaworks.com.br",
    img: "assets/img/portfolio/rpaworks-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/ff6a00/ffffff?text=RPAWorks+Site"
  },
  {
    id: 2,
    title: "Dashboard BI Financeiro",
    desc: "Painel interativo com KPIs em tempo real, filtros dinâmicos e export PDF/Excel. Desenvolvido em Python + Plotly.",
    category: "dashboard",
    url: "https://portdashone.netlify.app/",
    img: "assets/img/portfolio/dashboard-bi-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/3b82f6/ffffff?text=Dashboard+BI"
  },
  {
    id: 12,
    title: "DesingPersonalizze",
    desc: "Site para Desing's — landing page de alta conversão com animações, chatbot e integração WhatsApp.",
    category: "site",
    url: "https://desingpersonalizze.netlify.app/",
    img: "assets/img/portfolio/Desing.png",
    imgFallback: "https://placehold.co/800x450/ff6a00/ffffff?text=RPAWorks+Site"
  },

    {
    id: 13,
    title: "rafahacessorios",
    desc: "Site para Vendedor — landing page de alta conversão com animações, chatbot e integração WhatsApp.",
    category: "site",
    url: "https://rafahacessorios.netlify.app/",
    img: "assets/img/portfolio/Rafa.png",
    imgFallback: "https://placehold.co/800x450/ff6a00/ffffff?text=RPAWorks+Site"
  },

      {
    id: 14,
    title: "ARTIC INK",
    desc: "Site para Tatuador — landing page de alta conversão com animações, chatbot e integração WhatsApp.",
    category: "site",
    url: "https://tattoport.netlify.app/",
    img: "assets/img/portfolio/Artic.png",
    imgFallback: "https://placehold.co/800x450/ff6a00/ffffff?text=RPAWorks+Site"
  },

        {
    id: 15,
    title: "Lex Consultoria!",
    desc: "Site para Consultoria — landing page de alta conversão com animações, chatbot e integração WhatsApp.",
    category: "site",
    url: "https://consultoriojuri.netlify.app/",
    img: "assets/img/portfolio/Lex.png",
    imgFallback: "https://placehold.co/800x450/ff6a00/ffffff?text=RPAWorks+Site"
  },
  {
    id: 3,
    title: "Robô de Processos — NF-e",
    desc: "Automação de leitura de notas fiscais, preenchimento de ERP e geração de relatório diário via e-mail.",
    category: "rpa",
    url: "#",
    img: "assets/img/portfolio/rpa-nfe-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/10b981/ffffff?text=RPA+NF-e"
  },
  {
    id: 4,
    title: "Landing Page Sumiê Tattoo",
    desc: "Site para um tatuador Japones com agendamento online, galeria de resultados.",
    category: "site",
    url: "https://sumietattoo.netlify.app/",
    img: "assets/img/portfolio/clinica-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },
  {
    id: 5,
    title: "Dashboard Vendas",
    desc: "Análise de funil de vendas, ranking de produtos e mapa de calor regional. Integração com Google Sheets.",
    category: "dashboard",
    url: "#",
    img: "assets/img/portfolio/dashboard-vendas-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/6366f1/ffffff?text=Dashboard+Vendas"
  },

    {
    id: 7,
    title: "Nick tatto",
    desc: "Site para um tatuador com portifolio online, galeria de resultados.",
    category: "site",
    url: "https://nick-tatto.netlify.app/",
    img: "assets/img/portfolio/Nicktatto.jpg",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },
  {
    id: 6,
    title: "Automação Folha de Pagamento",
    desc: "RPA que consolida horas, calcula adicionais e gera o arquivo de remessa bancária automaticamente.",
    category: "rpa",
    url: "#",
    img: "assets/img/portfolio/rpa-folha-thumb.jpg",
    imgFallback: "https://placehold.co/800x450/059669/ffffff?text=RPA+Folha"
  },

     {
    id: 8,
    title: "Nosferatos Corretor",
    desc: "Site para Corretores com portifolio online, galeria de resultados e bot.",
    category: "site",
    url: "https://nosferatos.netlify.app/",
    img: "assets/img/portfolio/Nosferatos.png",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },
       {
    id: 9,
    title: "Style clin",
    desc: "Site para Clinicas com portifolio online, galeria de resultados e bot.",
    category: "site",
    url: "https://styleclin-barueri.netlify.app/",
    img: "assets/img/portfolio/Estetica.png",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },

         {
    id: 10,
    title: "YURI JUANNINI",
    desc: "Site para Barbeiros com portifolio online, galeria de resultados e preços.",
    category: "site",
    url: "https://barbeariayurijuannini.onrender.com/",
    img: "assets/img/portfolio/Yuri.jpg",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },
           {
    id: 11,
    title: "Milena Esperandio",
    desc: "Site para Advogados com ChatBot online, galeria de resultados e Contatos.",
    category: "site",
    url: "https://milena-prot2.onrender.com/",
    img: "assets/img/portfolio/Milena.png",
    imgFallback: "https://placehold.co/800x450/f97316/ffffff?text=Cl%C3%ADnica+Est%C3%A9tica"
  },
  
];

// ── Labels e cores por categoria ───────────────────────────
const CAT_LABELS = {
  site:      { label: "Site & Landing Page", dotClass: "cat-card__tag-dot--site" },
  dashboard: { label: "Dashboard",           dotClass: "cat-card__tag-dot--dashboard" },
  rpa:       { label: "RPA & Automação",     dotClass: "cat-card__tag-dot--rpa" }
};

// ── Estado ─────────────────────────────────────────────────
let _catOpen    = false;
let _catFilter  = "all";
let _catVisible = 0;

// ── DOM helpers ────────────────────────────────────────────
function qs(sel, ctx = document) { return ctx.querySelector(sel); }

// ── Render cards ───────────────────────────────────────────
function catRenderCards(container) {
  container.innerHTML = "";

  const filtered = _catFilter === "all"
    ? CAT_PROJECTS
    : CAT_PROJECTS.filter(p => p.category === _catFilter);

  _catVisible = filtered.length;

  // empty state
  let emptyEl = qs(".cat-empty");
  if (!emptyEl) {
    emptyEl = document.createElement("div");
    emptyEl.className = "cat-empty";
    emptyEl.innerHTML = `<span class="cat-empty__icon">🔍</span><p class="cat-empty__text">Nenhum projeto nessa categoria ainda — em breve!</p>`;
    container.appendChild(emptyEl);
  }
  emptyEl.classList.toggle("is-visible", filtered.length === 0);

  filtered.forEach((proj, i) => {
    const info   = CAT_LABELS[proj.category] || CAT_LABELS.site;
    const isLink = proj.url && proj.url !== "#";
    const el     = document.createElement("a");

    el.className    = "cat-card";
    el.href         = proj.url || "#";
    el.target       = isLink ? "_blank" : "_self";
    el.rel          = isLink ? "noopener noreferrer" : "";
    el.style.setProperty("--delay", `${i * 60}ms`);
    el.setAttribute("aria-label", `Ver projeto: ${proj.title}`);

    el.innerHTML = `
      <div class="cat-card__thumb is-loading">
        <img class="cat-card__img" src="${proj.imgFallback}" alt="Screenshot de ${proj.title}" loading="lazy" />
        <div class="cat-card__tag">
          <span class="cat-card__tag-dot ${info.dotClass}"></span>
          ${info.label}
        </div>
        <div class="cat-card__hover-overlay">
          <span class="cat-card__hover-btn">
            Ver site
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="cat-card__body">
        <h3 class="cat-card__title">${proj.title}</h3>
        <p class="cat-card__desc">${proj.desc}</p>
        <div class="cat-card__footer">
          <span class="cat-card__url">${isLink ? proj.url.replace(/^https?:\/\//, "") : "Em breve"}</span>
          <span class="cat-card__cta">
            ${isLink ? "Ver site" : "Em breve"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    `;

    // remove shimmer when image loads
    const img = el.querySelector(".cat-card__img");
    img.addEventListener("load", () => {
      el.querySelector(".cat-card__thumb").classList.remove("is-loading");
    });
    // fallback to real image after placeholder
    if (proj.img) {
      const real = new Image();
      real.onload = () => { img.src = proj.img; };
      real.src = proj.img;
    }

    container.appendChild(el);

    // staggered entrance
    setTimeout(() => {
      el.classList.add("is-visible");
    }, 80 + i * 60);
  });
}

// ── Update counter ─────────────────────────────────────────
function catUpdateCount(el) {
  const total = _catFilter === "all"
    ? CAT_PROJECTS.length
    : CAT_PROJECTS.filter(p => p.category === _catFilter).length;
  el.innerHTML = `<strong>${total}</strong> projeto${total !== 1 ? "s" : ""}`;
}

// ── Open / Close ───────────────────────────────────────────
function catOpen() {
  if (_catOpen) return;
  _catOpen = true;
  document.body.style.overflow = "hidden";

  const backdrop = qs(".cat-backdrop");
  const panel    = qs(".cat-panel");
  const grid     = qs(".cat-grid");
  const countEl  = qs(".cat-count");

  backdrop.classList.remove("is-close");
  panel.classList.remove("is-close");
  backdrop.classList.add("is-open");
  panel.classList.add("is-open");

  _catFilter = "all";
  qs(".cat-filter.is-active")?.classList.remove("is-active");
  qs('.cat-filter[data-filter="all"]')?.classList.add("is-active");

  catRenderCards(grid);
  catUpdateCount(countEl);

  // focus trap
  setTimeout(() => qs(".cat-close")?.focus(), 450);
}

function catClose() {
  if (!_catOpen) return;
  _catOpen = false;
  document.body.style.overflow = "";

  const backdrop = qs(".cat-backdrop");
  const panel    = qs(".cat-panel");

  backdrop.classList.add("is-close");
  panel.classList.add("is-close");

  const done = () => {
    backdrop.classList.remove("is-open", "is-close");
    panel.classList.remove("is-open", "is-close");
    backdrop.removeEventListener("animationend", done);
  };
  backdrop.addEventListener("animationend", done, { once: true });
}

// ── Build HTML ─────────────────────────────────────────────
function catBuildDOM() {
  if (qs(".cat-backdrop")) return; // já montado

  const backdrop = document.createElement("div");
  backdrop.className = "cat-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const panel = document.createElement("div");
  panel.className = "cat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Catálogo de projetos RPAWorks");

  panel.innerHTML = `
    <div class="cat-panel__inner">
      <header class="cat-header">
        <div class="cat-header__top">
          <div class="cat-header__left">
            <div class="cat-header__eyebrow">
              <span class="cat-header__eyebrow-dot"></span>
              Nossos trabalhos
            </div>
            <h2 class="cat-header__title">Catálogo de <span>projetos</span></h2>
            <p class="cat-header__sub">Clique em qualquer projeto para visitar o site real.</p>
          </div>
          <button class="cat-close" aria-label="Fechar catálogo" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="#0b1220" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="cat-controls">
        <div class="cat-filters">
          <button class="cat-filter is-active" data-filter="all" type="button">Todos</button>
          <button class="cat-filter" data-filter="site" type="button">Sites & LP</button>
          <button class="cat-filter" data-filter="dashboard" type="button">Dashboards</button>
          <button class="cat-filter" data-filter="rpa" type="button">RPA</button>
        </div>
        <span class="cat-count" aria-live="polite"></span>
      </div>

      <div class="cat-body">
        <div class="cat-grid"></div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  // ── Events ──────────────────────────────────────────────
  backdrop.addEventListener("click", catClose);

  qs(".cat-close", panel).addEventListener("click", catClose);

  panel.addEventListener("click", e => {
    if (e.target.classList.contains("cat-filter")) {
      qs(".cat-filter.is-active", panel)?.classList.remove("is-active");
      e.target.classList.add("is-active");
      _catFilter = e.target.dataset.filter;

      const grid    = qs(".cat-grid", panel);
      const countEl = qs(".cat-count", panel);
      catRenderCards(grid);
      catUpdateCount(countEl);
    }
  });

  // esc key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && _catOpen) catClose();
  });
}

// ── Nav link trigger ───────────────────────────────────────
// Procura o link "Portfólio" na nav e sobrescreve o comportamento
function catBindNavLink() {
  // seleciona todos os links de nav que apontam para #portfolio
  const links = document.querySelectorAll('a[href="#portfolio"], a[href="#catalogo"]');
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      catOpen();
    });
  });

  // botão dedicado (id="catOpenBtn") se existir
  const btn = document.getElementById("catOpenBtn");
  if (btn) btn.addEventListener("click", catOpen);
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  catBuildDOM();
  catBindNavLink();
});

// API pública
window.catOpen  = catOpen;
window.catClose = catClose;
