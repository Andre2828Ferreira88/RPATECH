// =========================================================
// RPAWorks — script.js (COMPLETO) com WhatsApp + MODAL bonito
// =========================================================

// ===== WhatsApp (CONFIG)
// Formato: 55 + DDD + número (somente dígitos)
// Ex.: "5511999999999"
const WHATSAPP_NUMBER = "5511961219986";

// =========================================================
// WhatsApp helpers
// =========================================================
function isWhatsappConfigured() {
  return WHATSAPP_NUMBER && !WHATSAPP_NUMBER.includes("SEUNUMERO");
}

function openWhatsApp(message) {
  if (!isWhatsappConfigured()) return false;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
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
          <p class="leadModal__sub">Só pra eu montar a mensagem com seus dados + o plano escolhido.</p>
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
// Mensagem WhatsApp (plano + cliente)
// =========================================================
function openPlanWhatsApp(plan, lead) {
  const msg =
    `Olá! Vim pelo site da RPAWorks.\n\n` +
    `📌 Cliente:\n` +
    `• Nome: ${lead.name}\n` +
    `• WhatsApp: ${lead.phone}\n` +
    `• Necessidade: ${lead.need}\n\n` +
    `📦 Plano escolhido:\n` +
    `• Categoria: ${plan.cat}\n` +
    `• Plano: ${plan.tier} — ${plan.name}\n` +
    `• ${plan.mode}: ${plan.price}\n` +
    `• Servidor sugerido: ${plan.server}\n\n` +
    `Pode me passar os próximos passos e prazo?`;

  openWhatsApp(msg);
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
        tier: "BASIC",
        name: "Presença Online",
        featured: false,
        setup: "R$ 900 – R$ 1.500",
        mensalidade: "R$ 159 – R$ 399 /mês",
        server: "Render Starter ($7)",
        items: [
          "1 página (ou até 3 se for bem leve)",
          "Responsivo + WhatsApp + SEO básico",
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
          "SEO melhorado + performance",
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
        <span class="chip">🖥️ ${p.server}</span>
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
    observeReveal(div); // anima o card
  });

  // anima itens internos, se tiver
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
// Clique no plano -> WhatsApp com PLANO + CLIENTE (modal bonito)
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

    // se já tem lead salvo, vai direto
    const leadSaved = getLead();
    if (leadIsValid(leadSaved)) {
      openPlanWhatsApp(planPayload, leadSaved);
      return;
    }

    // tenta pegar do form se já estiver preenchido
    const leadFromForm = getLeadFromFormLoose();
    if (leadIsValid(leadFromForm)) {
      setLead(leadFromForm);
      openPlanWhatsApp(planPayload, leadFromForm);
      return;
    }

    // senão abre modal bonito
    openLeadModal(planPayload);
  });
}

// =========================================================
// Formulário final -> WhatsApp + salva lead
// (funciona mesmo com seu form atual; não precisa ids)
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
      `Olá! Vim pelo site da RPAWorks.\n\n` +
      `📌 Cliente:\n` +
      `• Nome: ${lead.name}\n` +
      `• WhatsApp: ${lead.phone}\n` +
      `• Necessidade: ${lead.need}\n\n` +
      `Pode me chamar para alinharmos escopo e orçamento?`;

    openWhatsApp(msg);
  });

  // se existir botão com data-toast, faz ele submeter o form
  const toastBtn = contactForm.querySelector("[data-toast]");
  if (toastBtn) {
    toastBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (contactForm.requestSubmit) contactForm.requestSubmit();
      else contactForm.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  }
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
// Year
// =========================================================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
d
