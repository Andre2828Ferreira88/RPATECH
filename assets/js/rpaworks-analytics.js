(function () {
  "use strict";
  if (window.__rpaAnalyticsLoaded) return;
  var config = window.RPA_ANALYTICS_CONFIG || {};
  var location = window.location;
  var localHost = /^(localhost(?:\..*)?|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})$/i;
  if (!/^https?:$/.test(location.protocol) || (!config.trackLocal && localHost.test(location.hostname))) return;
  window.__rpaAnalyticsLoaded = true;

  var parts = location.pathname.split("/").filter(Boolean);
  var filename = (parts.pop() || "index").replace(/\.html$/i, "").toLowerCase();
  var names = { index: "home", site: "landing_site", sistemas: "landing_sistemas" };
  var page = Object.prototype.hasOwnProperty.call(names, filename) ? names[filename] : "outra_pagina";
  var clarityId = /^[a-z0-9]{5,32}$/i.test(config.clarityProjectId || "") ? config.clarityProjectId : "";
  var adsId = /^AW-\d+$/.test(config.googleAdsId || "") ? config.googleAdsId : "";
  var ga4Id = /^G-[A-Z0-9]{6,}$/i.test(config.ga4MeasurementId || "") ? config.ga4MeasurementId : "";
  var pixelId = /^\d{6,20}$/.test(config.metaPixelId || "") ? config.metaPixelId : "";
  var adsClickSendTo = /^AW-\d+\/[A-Za-z0-9_-]+$/.test(config.googleAdsWhatsAppSendTo || "") ? config.googleAdsWhatsAppSendTo : "";

  function loadTag(id, src, existingSelector) {
    if (document.getElementById(id) || (existingSelector && document.querySelector(existingSelector))) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  var campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
  var attribution = {};
  function cleanCampaign(input) {
    var clean = {};
    campaignKeys.forEach(function (key) {
      if (!input || typeof input[key] !== "string") return;
      var value = input[key].trim().slice(0, 120);
      // Não copia e-mails nem caracteres de controle para eventos de campanha.
      if (value && value.indexOf("@") === -1 && !/[\x00-\x1f\x7f]/.test(value)) clean[key] = value;
    });
    return clean;
  }
  try {
    var params = new URLSearchParams(location.search);
    var incoming = {};
    campaignKeys.forEach(function (key) { if (params.has(key)) incoming[key] = params.get(key); });
    attribution = cleanCampaign(incoming);
    if (Object.keys(attribution).length) {
      try { window.sessionStorage.setItem("rpaworks_campaign", JSON.stringify({time:Date.now(),values:attribution})); } catch (ignoreStorageWrite) {}
    } else {
      try {
        var stored = JSON.parse(window.sessionStorage.getItem("rpaworks_campaign") || "null");
        if (stored && typeof stored.time === "number" && Date.now() - stored.time >= 0 && Date.now() - stored.time < 86400000) attribution = cleanCampaign(stored.values);
      } catch (ignoreStorageRead) {}
    }
  } catch (ignoreCampaign) {}

  if (clarityId) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    window.clarity("set", "pagina_rpaworks", page);
    Object.keys(attribution).forEach(function (key) { window.clarity("set", key, attribution[key]); });
    window.clarity("event", "visita_" + page);
    loadTag("rpa-clarity-tag", "https://www.clarity.ms/tag/" + clarityId, 'script[src*="clarity.ms/tag/"]');
  }
  if (adsId || ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    if (adsId) window.gtag("config", adsId);
    if (ga4Id) window.gtag("config", ga4Id);
    loadTag("rpa-google-tag", "https://www.googletagmanager.com/gtag/js?id=" + (ga4Id || adsId), 'script[src*="googletagmanager.com/gtag/js"]');
  }
  if (pixelId) {
    if (!window.fbq) {
      var queue = window.fbq = function () { queue.callMethod ? queue.callMethod.apply(queue, arguments) : queue.queue.push(arguments); };
      if (!window._fbq) window._fbq = queue;
      queue.push = queue;
      queue.loaded = true;
      queue.version = "2.0";
      queue.queue = [];
    }
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
    loadTag("rpa-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js", 'script[src*="connect.facebook.net/"][src*="fbevents.js"]');
  }

  function eventParameters(name) {
    var data = { page_key: page, cta_id: name, link_type: "whatsapp" };
    Object.keys(attribution).forEach(function (key) { data[key] = attribution[key]; });
    return data;
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target) return;
    if (typeof target.closest !== "function") target = target.parentElement;
    if (!target || typeof target.closest !== "function") return;
    var element = target.closest("[data-rpa-event], a[data-whatsapp], a[href^='https://wa.me/'], a[href^='https://api.whatsapp.com/']");
    if (!element) return;
    var href = element.getAttribute("href") || "";
    var isWhatsApp = element.hasAttribute("data-whatsapp") || /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href);
    var name = element.getAttribute("data-rpa-event") || (isWhatsApp ? "whatsapp_outro" : "clique_link");
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(name)) return;

    // Cada fornecedor é independente: um bloqueador não interrompe os outros eventos nem o link.
    if (clarityId) {
      try {
        window.clarity("event", page + "_" + name);
        window.clarity("set", "elemento_clicado", name);
        if (isWhatsApp) window.clarity("event", "whatsapp_click");
      } catch (ignoreClarity) {}
    }
    if (!isWhatsApp) return;
    if (ga4Id) {
      try {
        var gaParams = eventParameters(name);
        gaParams.send_to = ga4Id;
        window.gtag("event", "whatsapp_click", gaParams);
      } catch (ignoreGA4) {}
    }
    if (pixelId) {
      try { window.fbq("trackCustom", "WhatsAppClick", eventParameters(name)); } catch (ignoreMeta) {}
    }
    if (adsId && adsClickSendTo) {
      try {
        window.gtag("event", "conversion", { send_to: adsClickSendTo, transport_type: "beacon" });
      } catch (ignoreAds) {}
    }
    // Sem preventDefault, window.open, redirecionamento ou espera por eventos de terceiros.
    // Cliques nunca disparam Purchase, Lead, generate_lead ou venda confirmada.
  }, true);

  window.RPAAnalytics = {
    getStatus: function () {
      return {page:page,clarityEnabled:!!clarityId,googleAdsEnabled:!!adsId,ga4Enabled:!!ga4Id,metaPixelEnabled:!!pixelId,attribution:Object.assign({},attribution)};
    }
  };
}());
