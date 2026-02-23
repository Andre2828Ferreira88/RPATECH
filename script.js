// =========================================================
// RPAWorks — script.js (COMPLETO)
// WhatsApp + Modal de lead + Planos + Chatbot (clique-only)
// =========================================================

// ===== WhatsApp (CONFIG) =====
// Formato: 55 + DDD + número (somente dígitos)
// Formato: 55 + DDD + número (somente dígitos)
const WHATSAPP_NUMBER = "5511961219986"; // <-- seu número

function isWhatsappConfigured() {
  return /^\d{10,15}$/.test(WHATSAPP_NUMBER); // valida dígitos e tamanho
}

function openWhatsApp(message) {
  if (!isWhatsappConfigured()) return false;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // tenta nova aba; se popup bloqueado, abre na mesma aba
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;

  return true;
}

function openWhatsAppTracked(message) {
  if (!isWhatsappConfigured()) return false;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Dispara conversão do Google Ads e redireciona pro WhatsApp
  if (typeof window.gtag_report_conversion === "function") {
    window.gtag_report_conversion(url);
    return true;
  }

  // fallback se a função não existir
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
  return true;
}

// =========================================================
// Lead (dados do cliente) — salva no navegador
// =========================================================
const LEAD_KEY = "rpa_lead_v2";
let __pendingPlanPayload = null;

function getLead() {
  try {
    return JSON.parse(localStorage.getItem(LEAD_KEY) || "null");
  } catch {
    return null;
  }
}

function setLead(lead) {
  localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
}

function leadIsValid(lead) {
  return !!(lead && lead.name && lead.phone && lead.need);
}

// tenta pegar do form atual (mesmo que não tenha ids)
function getLeadFromFormLoose() {
  const form = document.querySelector("form.form");
  if (!form) return null;

  const inputs = Array.from(form.querySelectorAll("input, textarea"));
  if (inputs.length < 3) return null;

  const name = (inputs[0].value || "").trim();
  const phone = (inputs[1].value || "").trim();
  const need = (inputs[2].value || "").trim();

  if (!name || !phone || !need) return null;
  return { name, phone, need };
}

// =========================================================
// Modal bonito (injeta via JS)
// =========================================================
function injectLeadModal() {
  if (document.getElementById("leadModal")) return;

  const modal = document.createElement("div");
  modal.className = "leadModal";
  modal.id = "leadModal";
  modal.innerHTML = `
    <div class="leadModal__card" role="dialog" aria-modal="true" aria-label="Dados para WhatsApp">
      <div class="leadModal__top">
        <div>
          <h3 class="leadModal__title">Antes de abrir o WhatsApp</h3>
          <p class="leadModal__sub">Informe seus dados para eu montar a mensagem com o plano escolhido.</p>
        </div>
        <button class="leadModal__x" type="button" data-lead-close aria-label="Fechar">✕</button>
      </div>

      <div class="leadModal__body">
        <form id="leadModalForm">
          <div class="leadModal__grid">
            <label>
              Seu nome
              <input id="leadMName" type="text" placeholder="Ex: Andre" autocomplete="name" required />
            </label>

            <label>
              Seu WhatsApp
              <input id="leadMPhone" type="tel" placeholder="Ex: (11) 9xxxx-xxxx" autocomplete="tel" required />
            </label>

            <label>
              O que você precisa?
              <textarea id="leadMNeed" rows="3" placeholder="Ex: Site profissional + WhatsApp + SEO" required></textarea>
            </label>
          </div>

          <p class="leadModal__hint">Ao continuar, você será direcionado ao WhatsApp com a mensagem pronta.</p>

          <div class="leadModal__row">
            <button class="btn btn--ghost" type="button" data-lead-cancel>Agora não</button>
            <button class="btn btn--primary" type="submit">Continuar no WhatsApp</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // fecha clicando no backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLeadModal();
  });

  modal.querySelector("[data-lead-close]")?.addEventListener("click", closeLeadModal);
  modal.querySelector("[data-lead-cancel]")?.addEventListener("click", closeLeadModal);

  // submit do modal
  modal.querySelector("#leadModalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("leadMName")?.value?.trim() || "";
    const phone = document.getElementById("leadMPhone")?.value?.trim() || "";
    const need = document.getElementById("leadMNeed")?.value?.trim() || "";

    if (!name || !phone || !need) return;

    const lead = { name, phone, need };
    setLead(lead);
    closeLeadModal();

    if (__pendingPlanPayload) {
      const payload = __pendingPlanPayload;
      __pendingPlanPayload = null;
      openPlanWhatsApp(payload, lead);
    }
  });
}

function openLeadModal(planPayload) {
  injectLeadModal();
  __pendingPlanPayload = planPayload;

  // pré-preenche se já tiver algo no form
  const fromForm = getLeadFromFormLoose();
  if (fromForm) {
    document.getElementById("leadMName").value = fromForm.name;
    document.getElementById("leadMPhone").value = fromForm.phone;
    document.getElementById("leadMNeed").value = fromForm.need;
  }

  const modal = document.getElementById("leadModal");
  modal.classList.add("is-open");
  setTimeout(() => document.getElementById("leadMName")?.focus(), 60);
}

function closeLeadModal() {
  const modal = document.getElementById("leadModal");
  if (!modal) return;
  modal.classList.remove("is-open");
}

// =========================================================
// Mensagem WhatsApp (plano + cliente) — SEM emojis
// =========================================================
function openPlanWhatsApp(plan, lead) {
  const msg =
    `Olá. Vim pelo site da RPAWorks.\n\n` +
    `Cliente:\n` +
    `- Nome: ${lead.name}\n` +
    `- WhatsApp: ${lead.phone}\n` +
    `- Necessidade: ${lead.need}\n\n` +
    `Plano escolhido:\n` +
    `- Categoria: ${plan.cat}\n` +
    `- Plano: ${plan.tier} — ${plan.name}\n` +
    `- ${plan.mode}: ${plan.price}\n` +
    `- Servidor sugerido: ${plan.server}\n\n` +
    `Pode me passar os próximos passos e prazo?`;

  openWhatsAppTracked(msg);
}

// =========================================================
// Mobile menu
// =========================================================
const hamb = document.querySelector("[data-hamb]");
const mobile = document.querySelector("[data-mobile]");

if (hamb && mobile) {
  hamb.addEventListener("click", () => {
    const expanded = hamb.getAttribute("aria-expanded") === "true";
    hamb.setAttribute("aria-expanded", String(!expanded));
    mobile.style.display = expanded ? "none" : "block";
  });

  mobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      hamb.setAttribute("aria-expanded", "false");
      mobile.style.display = "none";
    });
  });
}

// =========================================================
// Smooth scroll (with sticky offset)
// =========================================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

// =========================================================
// Reveal (um observer só, sem conflito)
// =========================================================
const revealEls = document.querySelectorAll(".reveal");
const revealIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.14 }
);
revealEls.forEach((r) => revealIO.observe(r));

// helper para observar elementos novos (plans render)
function observeReveal(el) {
  if (!el || !el.classList || !el.classList.contains("reveal")) return;
  revealIO.observe(el);
}

// =========================================================
// Counters
// =========================================================
function animateCounter(el, to) {
  const duration = 900;
  const start = performance.now();
  const from = 0;

  const step = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const val = Math.floor(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    el.textContent = val;
    if (p < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

const counters = document.querySelectorAll("[data-counter]");
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseInt(el.getAttribute("data-counter"), 10);
      if (!el.dataset.done) {
        el.dataset.done = "1";
        animateCounter(el, to);
      }
    });
  },
  { threshold: 0.4 }
);
counters.forEach((c) => counterIO.observe(c));

// =========================================================
// Plans (dados)
// =========================================================
const planData = {
  sites: {
    title: "Sites",
    subtitle: "Presença, conversão e evolução para sistema.",
    plans: [
      {
        tier: "BASIC lux",
        name: "Presença Online",
        featured: false,
        setup: "R$ 859 – R$ 1.100",
        mensalidade: "R$ 159 – R$ 399 /mês",
        server: "Render Starter ($7)",
        items: [
          "1 página (ou até 3 se for bem leve)",
          "Responsivo + WhatsApp + SEO básico + Local de vendas + Bot de duvidas + Simulação",
          "1 alteração pequena/mês (texto/contato/horário)",
        ],
        cta: "Quero o BASIC",
      },
      {
        tier: "PRO",
        name: "Empresa Profissional",
        featured: true,
        setup: "R$ 1.800 – R$ 2.999",
        mensalidade: "R$ 599 – R$ 699 /mês",
        server: "Render Standard ($25) (ou Starter se for estático)",
        items: [
          "Até 5 páginas",
          "Formulário (e-mail/WhatsApp)",
          "SEO melhorado + performance + Responsivo + Local de vendas + Bot de duvidas + Simulação",
          "2 alterações/mês",
        ],
        cta: "Quero o PRO",
        badge: "Mais vendido",
      },
      {
        tier: "PREMIUM",
        name: "Site com Sistema",
        featured: false,
        setup: "R$ 4.900 – R$ 8.900",
        mensalidade: "R$ 799 – R$ 999 /mês",
        server: "Render Standard (ou Pro se pesado)",
        items: [
          "Área administrativa / painel simples",
          "Integrações (Google Sheets, e-mail, etc.)",
          "4 alterações/mês + suporte prioritário",
        ],
        cta: "Quero o PREMIUM",
      },
    ],
  },

  dashboards: {
    title: "Dashboards Interativos (Python)",
    subtitle: "KPIs, filtros, upload e performance com visual “empresa”.",
    plans: [
      {
        tier: "BASIC",
        name: "Painel Essencial",
        featured: false,
        setup: "R$ 1.900 – R$ 3.500",
        mensalidade: "R$ 249 – R$ 449 /mês",
        server: "Render Standard ($25)",
        items: [
          "1 dashboard + até 6 KPIs",
          "Upload de planilha ou fonte simples",
          "Ajustes leves mensais",
        ],
        cta: "Quero o BASIC",
      },
      {
        tier: "PRO",
        name: "Painel de Gestão",
        featured: true,
        setup: "R$ 3.900 – R$ 6.900",
        mensalidade: "R$ 449 – R$ 899 /mês",
        server: "Render Standard (ou Pro se crescer)",
        items: [
          "Até 3 páginas de dashboard",
          "Filtros avançados + exportação",
          "Melhor organização/UX (layout mais “empresa”)",
        ],
        cta: "Quero o PRO",
        badge: "Equilíbrio perfeito",
      },
      {
        tier: "PREMIUM",
        name: "BI Sob Medida",
        featured: false,
        setup: "R$ 6.900 – R$ 12.900",
        mensalidade: "R$ 899 – R$ 1.990 /mês",
        server: "Render Pro ($85)",
        items: [
          "Multi-fontes (planilha + banco + API)",
          "Login/perfis",
          "Monitoramento + otimizações",
        ],
        cta: "Quero o PREMIUM",
      },
    ],
  },

  rpa: {
    title: "RPA (Robô / Automação)",
    subtitle: "Automação robusta, logs, alertas e relatórios (CSV/PDF).",
    plans: [
      {
        tier: "BASIC",
        name: "Automação de Tarefa",
        featured: false,
        setup: "R$ 2.900 – R$ 5.900",
        mensalidade: "R$ 499 – R$ 999 /mês",
        server: "Render Standard ($25)",
        items: ["1 processo automatizado", "Logs simples + alertas básicos", "1 ajuste/mês"],
        cta: "Quero o BASIC",
      },
      {
        tier: "PRO",
        name: "Operação Assistida",
        featured: true,
        setup: "R$ 5.900 – R$ 10.900",
        mensalidade: "R$ 999 – R$ 2.490 /mês",
        server: "Render Pro ($85) (se Playwright/navegador)",
        items: ["Rotina robusta (tentativas, exceções)", "Relatório em CSV/PDF", "Suporte prioritário"],
        cta: "Quero o PRO",
        badge: "Robustez",
      },
      {
        tier: "PREMIUM",
        name: "RPA Empresarial",
        featured: false,
        setup: "R$ 10.900 – R$ 24.900",
        mensalidade: "R$ 2.490 – R$ 5.900 /mês",
        server: "Render Pro / Pro Plus conforme carga",
        items: ["2 a 4 fluxos automatizados", "Monitoramento contínuo + correções rápidas", "SLA e evolução planejada"],
        cta: "Quero o PREMIUM",
      },
    ],
  },
};

let currentCat = "sites";
let currentMode = "mensalidade";

const plansGrid = document.getElementById("plansGrid");

function renderPlans() {
  if (!plansGrid) return;

  const cat = planData[currentCat];
  plansGrid.innerHTML = "";

  cat.plans.forEach((p) => {
    const div = document.createElement("article");
    div.className = "plan reveal" + (p.featured ? " featured" : "");

    const badge = p.badge ? `<div class="badge">${p.badge}</div>` : "";
    const modePrice = currentMode === "mensalidade" ? p.mensalidade : p.setup;
    const modeLabel = currentMode === "mensalidade" ? "Mensalidade" : "Setup";

    div.innerHTML = `
      ${badge}
      <div class="tier">${p.tier}</div>
      <h3>${p.name}</h3>
      <p class="sub">${cat.subtitle}</p>

      <div class="priceRow">
        <span class="k">${modeLabel}</span>
        <span class="v">${modePrice}</span>
      </div>

      <div class="meta">
        <span class="chip">Servidor: ${p.server}</span>
      </div>

      <ul>${p.items.map((i) => `<li>${i}</li>`).join("")}</ul>

      <a
        class="btn ${p.featured ? "btn--primary" : "btn--ghost"}"
        href="#contato"
        data-plan-cta="1"
        data-cat="${currentCat}"
        data-tier="${p.tier}"
        data-name="${p.name}"
        data-mode="${modeLabel}"
        data-price="${modePrice}"
        data-server="${p.server}"
      >${p.cta}</a>
    `;

    plansGrid.appendChild(div);
    observeReveal(div);
  });

  plansGrid.querySelectorAll(".reveal").forEach(observeReveal);
}

renderPlans();

// Tabs category
document.querySelectorAll("[data-cat]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentCat = btn.getAttribute("data-cat");

    document.querySelectorAll("[data-cat]").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });

    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    renderPlans();
  });
});

// Mode setup/mensalidade
document.querySelectorAll("[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentMode = btn.getAttribute("data-mode");
    document.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderPlans();
  });
});

// =========================================================
// Clique no plano -> WhatsApp com PLANO + CLIENTE
// =========================================================
const plansGridEl = document.getElementById("plansGrid");

if (plansGridEl) {
  plansGridEl.addEventListener("click", (e) => {
    const a = e.target.closest('a[data-plan-cta="1"]');
    if (!a) return;

    if (!isWhatsappConfigured()) {
      alert("Configure o número do WhatsApp no script.js (WHATSAPP_NUMBER).");
      return;
    }

    e.preventDefault();

    const planPayload = {
      cat: a.dataset.cat,
      tier: a.dataset.tier,
      name: a.dataset.name,
      mode: a.dataset.mode,
      price: a.dataset.price,
      server: a.dataset.server,
    };

    const leadSaved = getLead();
    if (leadIsValid(leadSaved)) {
      openPlanWhatsApp(planPayload, leadSaved);
      return;
    }

    const leadFromForm = getLeadFromFormLoose();
    if (leadIsValid(leadFromForm)) {
      setLead(leadFromForm);
      openPlanWhatsApp(planPayload, leadFromForm);
      return;
    }

    openLeadModal(planPayload);
  });
}

// =========================================================
// Formulário final -> WhatsApp + salva lead (SEM emojis)
// =========================================================
const contactForm = document.querySelector("form.form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!isWhatsappConfigured()) {
      alert("Configure o número do WhatsApp no script.js (WHATSAPP_NUMBER).");
      return;
    }

    const lead = getLeadFromFormLoose();
    if (!leadIsValid(lead)) {
      alert("Preencha Nome, WhatsApp e o que você precisa.");
      return;
    }

    setLead(lead);

    const msg =
      `Olá. Vim pelo site da RPAWorks.\n\n` +
      `Cliente:\n` +
      `- Nome: ${lead.name}\n` +
      `- WhatsApp: ${lead.phone}\n` +
      `- Necessidade: ${lead.need}\n\n` +
      `Pode me chamar para alinharmos escopo e orçamento?`;

    openWhatsAppTracked(msg);
  });
}

// =========================================================
// Tiny 3D tilt (subtil)
// =========================================================
const tilt = document.querySelector("[data-tilt]");
if (tilt) {
  const max = 8;

  const onMove = (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const rx = (-y * max).toFixed(2);
    const ry = (x * max).toFixed(2);
    tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const onLeave = () => {
    tilt.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  tilt.addEventListener("mousemove", onMove);
  tilt.addEventListener("mouseleave", onLeave);
}

// =========================================================
// Footer year
// =========================================================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// =========================================================
// CHATBOT — Clique-only (usa o HTML do index.html)
// =========================================================
(() => {
  const root = document.getElementById("rpawChat");
  const fab = document.getElementById("rpawFab");
  const panel = document.getElementById("rpawPanel");
  const backdrop = document.getElementById("rpawBackdrop");
  const closeBtn = document.getElementById("rpawClose");
  const minBtn = document.getElementById("rpawMin");
  const thread = document.getElementById("rpawThread");
  const choices = document.getElementById("rpawChoices");
  const body = document.getElementById("rpawBody");
  const ctaPrimary = document.getElementById("rpawCtaPrimary");
  const ctaSecondary = document.getElementById("rpawCtaSecondary");

  if (!root || !fab || !panel || !thread || !choices || !body) return;

  // Links
  const PORTFOLIO_URL = "https://www.rpaworks.com.br/";
  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  if (ctaPrimary) {
    ctaPrimary.setAttribute("href", "#");
    ctaPrimary.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openWhatsAppTracked("Olá. Quero um orçamento com a RPAWorks.");
    }, { passive: false });
  }
  if (ctaSecondary) ctaSecondary.href = PORTFOLIO_URL;

  // Flow
// ==== FLOW (perguntas prontas) ====
// Estrutura: node -> { bot: [msgs], options: [{label, next, cta?}] }
  const FLOW = {
    start: {
      bot: [
        "Selecione o tema. Em poucos cliques eu direciono para a melhor solução e, se fizer sentido, já abro o WhatsApp com uma mensagem pronta.",
      ],
      options: [
        { label: "Quero um orçamento", next: "quote_entry" },
        { label: "Serviços e o que a RPAWorks faz", next: "services" },
        { label: "Sites (institucional/portfólio)", next: "site" },
        { label: "Landing pages (vendas/captação)", next: "landing" },
        { label: "Automação / RPA", next: "rpa" },
        { label: "Dashboards / Dados", next: "data" },
        { label: "Integrações (APIs / WhatsApp / CRM)", next: "integrations" },
        { label: "SEO, performance e Google", next: "seo" },
        { label: "Hospedagem e domínio", next: "hosting" },
        { label: "Manutenção e suporte", next: "support" },
        { label: "Prazos e processo", next: "process" },
        { label: "Valores e negociação", next: "pricing" },
      ],
    },

    // =========================
    // Visão geral
    // =========================
    services: {
      bot: [
        "A RPAWorks entrega soluções completas: sites e landing pages, automações (RPA), integrações e dashboards.",
        "Selecione o que você quer entender melhor.",
      ],
      options: [
        { label: "O que é RPA e quando vale a pena?", next: "rpa_what" },
        { label: "Diferença entre site e landing page", next: "site_vs_landing" },
        { label: "Posso automatizar planilhas e relatórios?", next: "rpa_sheets" },
        { label: "Vocês fazem dashboard e BI?", next: "data_dashboards" },
        { label: "Vocês fazem integração com sistemas?", next: "integrations" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    site_vs_landing: {
      bot: [
        "Site institucional: credibilidade, presença e SEO (várias páginas, conteúdos e serviços).",
        "Landing page: foco em conversão (uma oferta/serviço, tráfego pago, WhatsApp/formulário).",
        "Se você quiser, a RPAWorks recomenda o formato ideal pelo seu objetivo.",
      ],
      options: [
        { label: "Quero recomendação rápida (objetivo)", next: "quote_goal" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    // =========================
    // Sites
    // =========================
    site: {
      bot: [
        "Sites da RPAWorks: design profissional, responsivo, rápido, preparado para SEO e conversão.",
        "Qual tipo de site você precisa?",
      ],
      options: [
        { label: "Institucional (empresa/serviços)", next: "site_inst" },
        { label: "Portfólio (projetos e cases)", next: "site_portfolio" },
        { label: "Site com agendamento/contato", next: "site_booking" },
        { label: "Site + blog/SEO (conteúdo)", next: "site_blog" },
        { label: "Site multilíngue", next: "site_multi" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    site_inst: {
      bot: [
        "Site institucional é ideal para posicionamento e confiança.",
        "A RPAWorks estrutura páginas essenciais e CTAs para gerar contato.",
        "Quer seguir para orçamento com mensagem pronta?",
      ],
      options: [
        { label: "Solicitar orçamento (site institucional)", next: "cta_site_inst", cta: "Quero um site institucional. Segmento e objetivo:" },
        { label: "Ver o que preciso te enviar (conteúdo)", next: "needs_site" },
        { label: "Voltar", next: "site" },
      ],
    },

    site_portfolio: {
      bot: [
        "Portfólio é excelente para mostrar autoridade e aumentar conversão.",
        "A RPAWorks organiza projetos, depoimentos e prova social.",
      ],
      options: [
        { label: "Solicitar orçamento (portfólio)", next: "cta_site_portfolio", cta: "Quero um site portfólio. Nicho e referências:" },
        { label: "Voltar", next: "site" },
      ],
    },

    site_booking: {
      bot: [
        "Podemos integrar agendamento (Calendly, WhatsApp, formulário ou sistema próprio).",
        "Você já usa alguma ferramenta de agenda?",
      ],
      options: [
        { label: "Sim, já uso ferramenta", next: "cta_site_booking", cta: "Quero um site com agendamento. Ferramenta atual:" },
        { label: "Não, quero recomendação", next: "cta_site_booking2", cta: "Quero um site com agendamento. Preciso de recomendação de ferramenta:" },
        { label: "Voltar", next: "site" },
      ],
    },

    site_blog: {
      bot: [
        "Blog é forte para SEO (Google): conteúdos trazem visitas e leads no médio prazo.",
        "A RPAWorks já deixa estrutura de categorias, artigos e performance pronta.",
      ],
      options: [
        { label: "Solicitar orçamento (site + blog)", next: "cta_site_blog", cta: "Quero um site com blog/SEO. Segmento e temas:" },
        { label: "Tirar dúvidas de SEO", next: "seo" },
        { label: "Voltar", next: "site" },
      ],
    },

    site_multi: {
      bot: [
        "Site multilíngue é indicado para negócios com público em mais de um idioma.",
        "A RPAWorks configura estrutura e boas práticas para indexação correta.",
      ],
      options: [
        { label: "Solicitar orçamento (multilíngue)", next: "cta_site_multi", cta: "Quero um site multilíngue. Idiomas e objetivo:" },
        { label: "Voltar", next: "site" },
      ],
    },

    needs_site: {
      bot: [
        "Para iniciar um site, normalmente precisamos:",
        "1) Logo e paleta (se tiver)",
        "2) Textos (ou pontos principais para copy)",
        "3) Serviços e diferenciais",
        "4) Fotos/portfólio (se houver)",
        "5) Referências de sites que você gosta",
        "Se você não tiver tudo, a RPAWorks organiza e te orienta no processo.",
      ],
      options: [
        { label: "Quero orçamento mesmo assim", next: "quote_entry" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    // =========================
    // Landing Pages
    // =========================
    landing: {
      bot: [
        "Landing page é focada em conversão: anúncio → página → contato.",
        "Qual objetivo principal?",
      ],
      options: [
        { label: "Gerar WhatsApp", next: "landing_wa" },
        { label: "Captar leads (formulário)", next: "landing_form" },
        { label: "Venda de um serviço/produto", next: "landing_sales" },
        { label: "Landing para tráfego pago", next: "landing_ads" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    landing_wa: {
      bot: [
        "Excelente para conversão rápida.",
        "A RPAWorks estrutura CTA, prova social e tracking para medir resultados.",
      ],
      options: [
        { label: "Solicitar orçamento (landing WhatsApp)", next: "cta_landing_wa", cta: "Quero uma landing page para gerar WhatsApp. Oferta/serviço:" },
        { label: "Voltar", next: "landing" },
      ],
    },

    landing_form: {
      bot: [
        "Captação por formulário funciona bem com CRM e automação de atendimento.",
        "A RPAWorks pode integrar com planilhas, e-mail, CRM ou API.",
      ],
      options: [
        { label: "Solicitar orçamento (landing formulário)", next: "cta_landing_form", cta: "Quero uma landing page com formulário. Público e oferta:" },
        { label: "Quero integrações (CRM/API)", next: "integrations" },
        { label: "Voltar", next: "landing" },
      ],
    },

    landing_sales: {
      bot: [
        "Landing de vendas exige copy, estrutura e prova social.",
        "A RPAWorks ajusta seções para aumentar taxa de conversão.",
      ],
      options: [
        { label: "Solicitar orçamento (landing vendas)", next: "cta_landing_sales", cta: "Quero uma landing page de vendas. Produto/serviço e ticket médio:" },
        { label: "Voltar", next: "landing" },
      ],
    },

    landing_ads: {
      bot: [
        "Para tráfego pago, o mais importante é: velocidade, mensagem clara e CTA forte.",
        "A RPAWorks também configura eventos (Google/Meta) e estrutura para testes A/B se necessário.",
      ],
      options: [
        { label: "Solicitar orçamento (landing tráfego)", next: "cta_landing_ads", cta: "Quero uma landing page para tráfego pago. Canal (Google/Meta) e oferta:" },
        { label: "Dúvidas de performance", next: "seo_perf" },
        { label: "Voltar", next: "landing" },
      ],
    },

    // =========================
    // Automação / RPA
    // =========================
    rpa: {
      bot: [
        "Automação / RPA reduz tempo operacional e erros em tarefas repetitivas.",
        "Que tipo de automação você precisa?",
      ],
      options: [
        { label: "Planilhas (Excel/Google Sheets)", next: "rpa_sheets" },
        { label: "Automação web (login, portais, preenchimentos)", next: "rpa_web" },
        { label: "Robô para relatórios e e-mails", next: "rpa_reports" },
        { label: "Integrações por API (sistemas)", next: "rpa_api" },
        { label: "Processos internos (rotinas)", next: "rpa_process" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    rpa_what: {
      bot: [
        "RPA (Robotic Process Automation) automatiza tarefas repetitivas como: copiar dados, preencher sistemas, gerar relatórios, validar informações e integrar ferramentas.",
        "Vale a pena quando há repetição, volume e regra clara. A RPAWorks mapeia o processo e entrega com documentação.",
      ],
      options: [
        { label: "Quero avaliar meu processo (orçamento)", next: "cta_rpa_eval", cta: "Quero avaliar um processo para automação/RPA. Descreva a rotina:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    rpa_sheets: {
      bot: [
        "Automação de planilhas: consolidação, limpeza, cruzamento de bases, exportações e relatórios.",
        "A RPAWorks pode integrar com e-mail, Drive e sistemas.",
      ],
      options: [
        { label: "Solicitar orçamento (planilhas)", next: "cta_rpa_sheets", cta: "Quero automação de planilhas. Fonte dos dados e objetivo:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    rpa_web: {
      bot: [
        "Automação web: portais, preenchimento de formulários, extração de dados, rotinas com login.",
        "A RPAWorks prioriza robustez e tratamento de erros para não quebrar fácil.",
      ],
      options: [
        { label: "Solicitar orçamento (automação web)", next: "cta_rpa_web", cta: "Quero automação web. Site/sistema e o que precisa fazer:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    rpa_reports: {
      bot: [
        "Podemos automatizar geração e envio de relatórios: PDF/Excel, dashboards, e-mail e WhatsApp (via integração).",
      ],
      options: [
        { label: "Solicitar orçamento (relatórios)", next: "cta_rpa_reports", cta: "Quero automação de relatórios. Periodicidade e fontes:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    rpa_api: {
      bot: [
        "Integrações via API conectam sistemas sem retrabalho manual (CRM, ERP, planilhas, gateways, etc.).",
        "A RPAWorks valida requisitos, autenticação e monitoramento.",
      ],
      options: [
        { label: "Solicitar orçamento (API)", next: "cta_rpa_api", cta: "Quero integração por API. Sistemas envolvidos e objetivo:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    rpa_process: {
      bot: [
        "Automação de processos internos: cadastros, conferência, atualização de status, rotinas recorrentes.",
        "O ideal é mapear a regra e os pontos de exceção.",
      ],
      options: [
        { label: "Solicitar orçamento (processo)", next: "cta_rpa_process", cta: "Quero automatizar um processo interno. Descreva o fluxo:" },
        { label: "Voltar", next: "rpa" },
      ],
    },

    // =========================
    // Dados / Dashboards
    // =========================
    data: {
      bot: [
        "Dados e dashboards: painéis de KPI, relatórios automáticos, consolidação de bases e visualização.",
        "Selecione o que você precisa.",
      ],
      options: [
        { label: "Dashboard (KPI / BI)", next: "data_dashboards" },
        { label: "Relatório automático (Excel/PDF)", next: "data_reports" },
        { label: "Organizar dados (ETL / pipeline)", next: "data_pipeline" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    data_dashboards: {
      bot: [
        "Dashboards: visão clara do negócio, KPIs e acompanhamento em tempo real.",
        "A RPAWorks pode integrar dados de planilhas, bancos e APIs.",
      ],
      options: [
        { label: "Solicitar orçamento (dashboard)", next: "cta_data_dash", cta: "Quero um dashboard. KPIs e fonte dos dados:" },
        { label: "Voltar", next: "data" },
      ],
    },

    data_reports: {
      bot: [
        "Relatórios automáticos: gera e envia em horário definido, com padronização e confiabilidade.",
      ],
      options: [
        { label: "Solicitar orçamento (relatórios)", next: "cta_data_reports", cta: "Quero relatório automático. Periodicidade e formato:" },
        { label: "Voltar", next: "data" },
      ],
    },

    data_pipeline: {
      bot: [
        "Pipeline/ETL: organizar dados, padronizar e deixar pronto para dashboard e decisão.",
      ],
      options: [
        { label: "Solicitar orçamento (pipeline)", next: "cta_data_pipe", cta: "Quero organizar dados (ETL/pipeline). Origem e destino:" },
        { label: "Voltar", next: "data" },
      ],
    },

    // =========================
    // Integrações
    // =========================
    integrations: {
      bot: [
        "Integrações conectam ferramentas e reduzem trabalho manual.",
        "O que você quer integrar?",
      ],
      options: [
        { label: "Formulário → planilha/CRM", next: "int_forms" },
        { label: "WhatsApp (fluxo de atendimento)", next: "int_whatsapp" },
        { label: "Pagamentos / checkout", next: "int_pay" },
        { label: "Integração entre sistemas (API)", next: "int_api" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    int_forms: {
      bot: [
        "Podemos enviar leads para planilha, e-mail ou CRM automaticamente e com validações.",
      ],
      options: [
        { label: "Solicitar orçamento (integração leads)", next: "cta_int_forms", cta: "Quero integração de formulário com planilha/CRM. Ferramenta atual:" },
        { label: "Voltar", next: "integrations" },
      ],
    },

    int_whatsapp: {
      bot: [
        "Podemos estruturar fluxos de atendimento, triagem e direcionamento por serviço.",
        "Se quiser, a RPAWorks define o roteiro e integra com seu processo.",
      ],
      options: [
        { label: "Solicitar orçamento (WhatsApp)", next: "cta_int_wa", cta: "Quero integração/fluxo no WhatsApp. Objetivo e serviços:" },
        { label: "Voltar", next: "integrations" },
      ],
    },

    int_pay: {
      bot: [
        "Integração de pagamento depende do modelo (checkout, link, gateway, recorrência).",
      ],
      options: [
        { label: "Solicitar orçamento (pagamentos)", next: "cta_int_pay", cta: "Quero integração de pagamento. Gateway/plataforma e produto:" },
        { label: "Voltar", next: "integrations" },
      ],
    },

    int_api: {
      bot: [
        "Integrações API: conectamos sistemas com segurança e logs para rastreio.",
      ],
      options: [
        { label: "Solicitar orçamento (API)", next: "cta_int_api", cta: "Quero integração entre sistemas via API. Sistemas e objetivo:" },
        { label: "Voltar", next: "integrations" },
      ],
    },

    // =========================
    // SEO / Performance
    // =========================
    seo: {
      bot: [
        "SEO e performance são essenciais para o Google e para conversão.",
        "Qual sua dúvida principal?",
      ],
      options: [
        { label: "Meu site aparece no Google?", next: "seo_index" },
        { label: "Velocidade / score e performance", next: "seo_perf" },
        { label: "SEO local (Maps)", next: "seo_local" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    seo_index: {
      bot: [
        "Para aparecer no Google, você precisa: site indexável, sitemap/robots configurados, boas práticas e conteúdo.",
        "A RPAWorks entrega estrutura correta e orienta os próximos passos (conteúdo e consistência).",
      ],
      options: [
        { label: "Solicitar orçamento (site/SEO)", next: "cta_seo", cta: "Quero um site preparado para SEO. Segmento e região:" },
        { label: "Voltar", next: "seo" },
      ],
    },

    seo_perf: {
      bot: [
        "Performance depende de: imagens otimizadas, código limpo, carregamento e hospedagem.",
        "A RPAWorks prioriza velocidade desde o layout até a entrega final.",
      ],
      options: [
        { label: "Solicitar orçamento (performance)", next: "cta_perf", cta: "Quero melhorar performance/score. Site atual e objetivo:" },
        { label: "Voltar", next: "seo" },
      ],
    },

    seo_local: {
      bot: [
        "SEO local fortalece sua presença no Google Maps e buscas por região.",
        "A RPAWorks ajusta site e orienta a parte de perfil/consistência de dados.",
      ],
      options: [
        { label: "Solicitar orçamento (SEO local)", next: "cta_local", cta: "Quero SEO local. Cidade/região e serviço:" },
        { label: "Voltar", next: "seo" },
      ],
    },

    // =========================
    // Hospedagem / Domínio
    // =========================
    hosting: {
      bot: [
        "Hospedagem e domínio: eu posso te orientar e a RPAWorks configura tudo de forma segura.",
        "O que você precisa?",
      ],
      options: [
        { label: "Comprar domínio", next: "host_domain" },
        { label: "Hospedar o site (opções)", next: "host_options" },
        { label: "E-mail profissional", next: "host_email" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    host_domain: {
      bot: [
        "Domínio: escolha curto, fácil e alinhado à marca.",
        "A RPAWorks pode te orientar na compra e configurar DNS, SSL e redirecionamentos.",
      ],
      options: [
        { label: "Solicitar ajuda (domínio)", next: "cta_domain", cta: "Quero ajuda para comprar/configurar domínio. Nome desejado:" },
        { label: "Voltar", next: "hosting" },
      ],
    },

    host_options: {
      bot: [
        "Hospedagem depende do seu tipo de projeto: site estático, landing, app com backend, automações.",
        "A RPAWorks recomenda a opção ideal por custo-benefício e estabilidade.",
      ],
      options: [
        { label: "Solicitar recomendação", next: "cta_host", cta: "Quero recomendação de hospedagem. Tipo de projeto:" },
        { label: "Voltar", next: "hosting" },
      ],
    },

    host_email: {
      bot: [
        "E-mail profissional aumenta credibilidade. Podemos configurar com domínio próprio.",
      ],
      options: [
        { label: "Solicitar orçamento (e-mail)", next: "cta_email", cta: "Quero e-mail profissional com meu domínio. Quantas contas?" },
        { label: "Voltar", next: "hosting" },
      ],
    },

    // =========================
    // Suporte / Manutenção
    // =========================
    support: {
      bot: [
        "Manutenção garante atualização, ajustes e suporte contínuo.",
        "Qual sua necessidade?",
      ],
      options: [
        { label: "Atualizações e melhorias mensais", next: "support_month" },
        { label: "Correções pontuais", next: "support_oneoff" },
        { label: "Monitoramento e estabilidade", next: "support_monitor" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    support_month: {
      bot: [
        "Plano mensal é ideal para evoluir o projeto com consistência.",
        "A RPAWorks pode ajustar layout, conteúdo, performance e acompanhar métricas.",
      ],
      options: [
        { label: "Solicitar orçamento (mensal)", next: "cta_support_month", cta: "Quero manutenção mensal. Site atual e objetivo:" },
        { label: "Voltar", next: "support" },
      ],
    },

    support_oneoff: {
      bot: [
        "Correções pontuais: bugs, layout quebrado, melhorias rápidas e otimização.",
      ],
      options: [
        { label: "Solicitar orçamento (pontual)", next: "cta_support_oneoff", cta: "Quero correção pontual. Problema e link do site:" },
        { label: "Voltar", next: "support" },
      ],
    },

    support_monitor: {
      bot: [
        "Monitoramento: estabilidade, performance, quedas e ajustes preventivos.",
      ],
      options: [
        { label: "Solicitar orçamento (monitoramento)", next: "cta_support_monitor", cta: "Quero monitoramento/estabilidade. Site e tráfego médio:" },
        { label: "Voltar", next: "support" },
      ],
    },

    // =========================
    // Processo / Prazos
    // =========================
    process: {
      bot: [
        "Processo RPAWorks:",
        "1) Diagnóstico do objetivo",
        "2) Proposta com escopo e prazos",
        "3) Design e aprovação",
        "4) Desenvolvimento e testes",
        "5) Publicação e ajustes finais",
      ],
      options: [
        { label: "Quanto tempo leva (média)?", next: "timeline" },
        { label: "O que preciso enviar para começar", next: "needs_general" },
        { label: "Solicitar orçamento", next: "quote_entry" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    timeline: {
      bot: [
        "Prazos variam por escopo. Em geral:",
        "Landing page: 1 a 3 dias (dependendo do conteúdo).",
        "Site institucional: 3 a 10 dias.",
        "Automação/RPA: depende do processo e integrações (diagnóstico rápido define o prazo).",
        "A RPAWorks acelera quando o conteúdo está alinhado (logo, textos e referências).",
      ],
      options: [
        { label: "Solicitar orçamento com prazo", next: "quote_entry" },
        { label: "Voltar", next: "process" },
      ],
    },

    needs_general: {
      bot: [
        "Para começar, geralmente precisamos:",
        "1) Objetivo do projeto (vendas, credibilidade, leads, automação, etc.)",
        "2) Segmento e público-alvo",
        "3) Referências (sites/landing que você gosta)",
        "4) Conteúdo disponível (logo, fotos, textos) — se não tiver, a RPAWorks orienta.",
      ],
      options: [
        { label: "Quero orçamento", next: "quote_entry" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    // =========================
    // Preços / negociação
    // =========================
    pricing: {
      bot: [
        "Valores variam por escopo, páginas, integrações e nível de automação.",
        "A RPAWorks pode ajustar escopo e negociar valores para caber no seu momento.",
        "Selecione o tipo de projeto para eu abrir uma mensagem pronta.",
      ],
      options: [
        { label: "Orçamento: Landing page", next: "cta_price_landing", cta: "Quero orçamento de landing page. Objetivo, oferta e referência:" },
        { label: "Orçamento: Site", next: "cta_price_site", cta: "Quero orçamento de site. Segmento, páginas e referência:" },
        { label: "Orçamento: Automação/RPA", next: "cta_price_rpa", cta: "Quero orçamento de automação/RPA. Descreva a rotina e sistemas:" },
        { label: "Quero negociar o preço", next: "negotiation" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    negotiation: {
      bot: [
        "Podemos negociar valores ajustando escopo, prazo e prioridades.",
        "A RPAWorks propõe opções (essencial / recomendado / completo) para você escolher com clareza.",
        "Se quiser, eu já abro o WhatsApp com uma mensagem pronta.",
      ],
      options: [
        { label: "Negociar no WhatsApp", next: "go_wa", cta: "Quero negociar o preço. Meu orçamento e prioridade são:" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    // =========================
    // Entrada de orçamento (genérica)
    // =========================
    quote_entry: {
      bot: [
        "Para agilizar, vou abrir o WhatsApp com uma mensagem pronta.",
        "No atendimento, a RPAWorks pode negociar valores ajustando escopo e prioridades.",
      ],
      options: [
        { label: "Continuar no WhatsApp", next: "go_wa", cta: "Quero um orçamento com a RPAWorks. Tipo de projeto e objetivo:" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    quote_goal: {
      bot: [
        "Qual é seu objetivo principal? Vou abrir o WhatsApp com a mensagem certa para a RPAWorks te direcionar.",
      ],
      options: [
        { label: "Quero vender mais (conversão)", next: "go_wa", cta: "Quero recomendação: meu objetivo é vender mais. Meu serviço/produto é:" },
        { label: "Quero mais credibilidade (site)", next: "go_wa", cta: "Quero recomendação: meu objetivo é credibilidade. Meu segmento é:" },
        { label: "Quero automatizar processo", next: "go_wa", cta: "Quero recomendação: meu objetivo é automatizar um processo. A rotina é:" },
        { label: "Voltar ao menu", next: "start" },
      ],
    },

    // =========================
    // CTAs específicos (mensagens prontas)
    // =========================
    cta_site_inst: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_site_portfolio: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_site_booking: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_site_booking2: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_site_blog: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_site_multi: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_landing_wa: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_landing_form: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_landing_sales: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_landing_ads: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_rpa_eval: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_rpa_sheets: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_rpa_web: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_rpa_reports: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_rpa_api: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_rpa_process: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_data_dash: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_data_reports: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_data_pipe: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_int_forms: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_int_wa: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_int_pay: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_int_api: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_seo: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_perf: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_local: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_domain: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_host: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_email: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_support_month: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_support_oneoff: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_support_monitor: { bot: ["Abrindo contato com a RPAWorks."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },

    cta_price_landing: { bot: ["Abrindo contato com a RPAWorks para orçamento."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_price_site: { bot: ["Abrindo contato com a RPAWorks para orçamento."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
    cta_price_rpa: { bot: ["Abrindo contato com a RPAWorks para orçamento."], options: [{ label: "Continuar no WhatsApp", next: "go_wa" }, { label: "Voltar ao menu", next: "start" }] },
  };

  function addMsg(text, who = "bot") {
    const el = document.createElement("div");
    el.className = `rpaw-msg ${who}`;
    el.textContent = text;
    thread.appendChild(el);
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }

  function setChoices(opts = []) {
    choices.innerHTML = "";
    opts.forEach((o) => {
      const b = document.createElement("button");
      b.className = "rpaw-chip";
      b.type = "button";
      b.textContent = o.label;

      b.addEventListener("click", () => {
        addMsg(o.label, "user");

        // Guarda CTA
        if (o.cta) choices.dataset.cta = o.cta;

        // WhatsApp
        if (o.next === "go_wa") {
          const base = choices.dataset.cta || "Olá. Quero um orçamento com a RPAWorks.";
          const msg =
            `${base}\n\n` +
            `Empresa/segmento:\n` +
            `Objetivo:\n` +
            `Prazo desejado:\n` +
            `Orçamento estimado (se houver):`;
          openWhatsAppTracked(msg);
          return;
        }

        go(o.next || "start");
      });

      choices.appendChild(b);
    });
  }

  function go(key) {
    const node = FLOW[key] || FLOW.start;
    setChoices([]);

    const msgs = Array.isArray(node.bot) ? node.bot : [node.bot];
    let i = 0;

    const push = () => {
      if (i < msgs.length) {
        addMsg(msgs[i], "bot");
        i++;
        setTimeout(push, 190);
      } else {
        setChoices(node.options || []);
      }
    };
    push();
  }

  function open() {
    root.classList.add("is-open");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");

    if (!thread.dataset.started) {
      thread.dataset.started = "1";
      go("start");
    }
  }

  function close() {
    root.classList.remove("is-open");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  fab.addEventListener("click", open);
  backdrop?.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);
  minBtn?.addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });
})();

(function () {
  const loader = document.getElementById("appLoader");
  const bar = document.getElementById("loaderBar");
  const meta = document.getElementById("loaderMeta");

  if (!loader) return;

  const pct = document.getElementById("loaderPct");

  // animação suave: em vez de “pular” % (8→15→35…), ele desliza
  let currentP = 0;
  let targetP = 0;
  let rafId = null;

  const render = () => {
    // aproxima do alvo com easing
    currentP += (targetP - currentP) * 0.12;
    if (Math.abs(targetP - currentP) < 0.08) currentP = targetP;

    const clamped = Math.max(0, Math.min(100, currentP));
    if (bar) bar.style.width = `${clamped}%`;
    if (pct) pct.textContent = `${Math.round(clamped)}%`;

    if (clamped !== targetP) rafId = requestAnimationFrame(render);
    else rafId = null;
  };

  const setBar = (p, text) => {
    targetP = Math.max(0, Math.min(100, p));
    if (meta && text) meta.textContent = text;
    if (!rafId) rafId = requestAnimationFrame(render);
  };

  const waitFonts = async () => {
    try {
      if (document.fonts && document.fonts.ready) {
        setBar(15, "Carregando tipografia");
        await document.fonts.ready;
      }
    } catch {}
  };

  const waitImages = async () => {
    const imgs = Array.from(document.images || []);
    if (!imgs.length) return;

    setBar(35, "Carregando imagens");
    await Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(res => {
          img.addEventListener("load", res, { once: true });
          img.addEventListener("error", res, { once: true });
        });
      })
    );
  };

  const waitHeroVideo = async () => {
    // tenta achar o vídeo do hero (ajuste o seletor se o seu for outro)
    const v =
      document.querySelector(".hero-video") ||
      document.querySelector("video[data-hero]") ||
      document.querySelector(".hero video") ||
      document.querySelector("video");

    if (!v) return;

    setBar(60, "Preparando vídeo do hero");
    await new Promise(res => {
      // se já tiver pronto, segue
      if (v.readyState >= 3) return res();
      const done = () => res();
      v.addEventListener("canplaythrough", done, { once: true });
      v.addEventListener("loadeddata", done, { once: true });
      v.addEventListener("error", done, { once: true });

      // fallback: não travar loader por causa do vídeo
      setTimeout(done, 2200);
    });
  };

  // tempo mínimo do loader (ms)
  const LOADER_MIN_MS = 2200;
  const LOADER_FADE_MS = 650;

  const startedAt = performance.now();

  let stepsTimer = null;
  let progTimer = null;


  const finish = () => {
    setBar(100, "Iniciando");

    try { if (stepsTimer) clearInterval(stepsTimer); if (progTimer) clearInterval(progTimer); } catch {}

    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, LOADER_MIN_MS - elapsed);

    setTimeout(() => {
      loader.style.transition = `opacity ${LOADER_FADE_MS}ms ease, transform ${LOADER_FADE_MS}ms ease`;
      loader.classList.add("is-hide");
      loader.setAttribute("aria-hidden", "true");
      setTimeout(() => loader.remove(), LOADER_FADE_MS + 120);
    }, wait);
  };

  

  // roda assim que DOM existe
  document.addEventListener("DOMContentLoaded", async () => {
    setBar(8, "Iniciando");

    // textos que trocam para não ficar “parado”
    const steps = [
      "Inicializando interface",
      "Carregando módulos",
      "Otimizando performance",
      "Preparando animações",
      "Finalizando"
    ];
    let si = 0;
    stepsTimer = setInterval(() => {
      si = (si + 1) % steps.length;
      if (meta) meta.textContent = steps[si];
    }, 650);

    // micro progress: sobe devagar até 92% e segura (finish completa)
    let fake = 10;
    progTimer = setInterval(() => {
      if (fake < 92) {
        fake += Math.random() * 3.8;
        setBar(fake);
      }
    }, 240);
    await waitFonts();
    await waitImages();
    await waitHeroVideo();
    finish();
  });
})();
// ========================================
// SaaS Entrance Animation
// ========================================
window.addEventListener("load", () => {

  const topbar = document.querySelector(".topbar");
  const heroCopy = document.querySelector(".hero__copy");
  const heroStats = document.querySelector(".hero__stats");

  if(topbar){
    topbar.style.opacity = 0;
    topbar.style.transform = "translateY(-10px)";
    setTimeout(()=>{
      topbar.style.transition = "all .6s cubic-bezier(.2,.8,.2,1)";
      topbar.style.opacity = 1;
      topbar.style.transform = "translateY(0)";
    }, 200);
  }

  if(heroCopy){
    heroCopy.style.opacity = 0;
    heroCopy.style.transform = "translateY(30px)";
    setTimeout(()=>{
      heroCopy.style.transition = "all .8s cubic-bezier(.2,.8,.2,1)";
      heroCopy.style.opacity = 1;
      heroCopy.style.transform = "translateY(0)";
    }, 400);
  }

  if(heroStats){
    heroStats.style.opacity = 0;
    heroStats.style.transform = "translateY(30px)";
    setTimeout(()=>{
      heroStats.style.transition = "all .8s cubic-bezier(.2,.8,.2,1)";
      heroStats.style.opacity = 1;
      heroStats.style.transform = "translateY(0)";
    }, 650);
  }

})



