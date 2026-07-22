const ENV = import.meta.env || {};

const CONFIG = {
  gtmId: ENV.VITE_GTM_ID || "",
  ga4Id: ENV.VITE_GA4_ID || "",
  googleAdsSendTo: ENV.VITE_GOOGLE_ADS_SEND_TO || "",
  leadEndpoint: ENV.VITE_LEAD_ENDPOINT || "/api/lead",
};

const PII_KEYS = new Set([
  "name",
  "nome",
  "phone",
  "telefone",
  "telefone_original",
  "email",
  "company",
  "empresa",
  "empresa_ou_propriedade",
  "city",
  "cidade",
  "lat",
  "lng",
  "latitude",
  "longitude",
  "comment",
  "mensagem",
  "user_agent",
]);

function cleanValue(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") return value.slice(0, 180);
  if (typeof value === "number" || typeof value === "boolean") return value;
  return undefined;
}

export function sanitizeTrackingPayload(payload = {}) {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (PII_KEYS.has(key)) return acc;
    const cleaned = cleanValue(value);
    if (cleaned !== undefined) acc[key] = cleaned;
    return acc;
  }, {});
}

export function createEventId(prefix = "projem") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() || "" : "";
}

export function getAttribution() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    gclid: params.get("gclid") || "",
    wbraid: params.get("wbraid") || "",
    gbraid: params.get("gbraid") || "",
    fbclid: params.get("fbclid") || "",
    msclkid: params.get("msclkid") || "",
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title || "",
    referrer: document.referrer || "",
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
  };
}

function injectScript(id, src) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initTracking() {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  if (CONFIG.gtmId && !window.__projemGtmLoaded) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    injectScript("projem-gtm", `https://www.googletagmanager.com/gtm.js?id=${CONFIG.gtmId}`);
    window.__projemGtmLoaded = true;
  }

  // Regra: se GTM existir, ele deve administrar o GA4. Isso evita duplicidade.
  if (!CONFIG.gtmId && CONFIG.ga4Id && !window.__projemGaLoaded) {
    injectScript("projem-ga4", `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ga4Id}`);
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.ga4Id, { send_page_view: true });
    window.__projemGaLoaded = true;
  }

}

export function trackEvent(eventName, payload = {}, eventId = "") {
  if (typeof window === "undefined") return;

  const safePayload = sanitizeTrackingPayload(payload);
  const eventPayload = {
    event_id: eventId || undefined,
    event_source: "lp_engenharia_projem",
    ...safePayload,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...eventPayload });

  if (!CONFIG.gtmId && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventPayload);
    if (eventName === "generate_lead" && CONFIG.googleAdsSendTo) {
      window.gtag("event", "conversion", {
        send_to: CONFIG.googleAdsSendTo,
        event_id: eventId || undefined,
        value: 1,
        currency: "BRL",
      });
    }
  }

  if (typeof window.fbq === "function") {
    if (eventName === "generate_lead") {
      window.fbq("track", "Lead", {
        content_name: "lead_engenharia_eletrica",
        content_category: "instalacoes_eletricas_industria_agro",
        ...safePayload,
      }, eventId ? { eventID: eventId } : undefined);
    }

    if (eventName === "whatsapp_click") {
      window.fbq("track", "Contact", {
        content_name: "whatsapp_click",
        content_category: "instalacoes_eletricas_industria_agro",
        ...safePayload,
      }, eventId ? { eventID: eventId } : undefined);
    }
  }
}

export async function sendLeadToEndpoint(payload) {
  const response = await fetch(CONFIG.leadEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || result?.ok === false) {
    throw new Error(result?.error || `lead_endpoint_${response.status}`);
  }

  return result || { ok: true };
}

export function buildWhatsAppUrl({ number, message }) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
