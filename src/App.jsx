import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  buildWhatsAppUrl,
  createEventId,
  getAttribution,
  initTracking,
  sendLeadToEndpoint,
  trackEvent,
} from "./tracking";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "555599686302";
const COMPANY_CNPJ = import.meta.env.VITE_COMPANY_CNPJ || "20.195.559/0001-21";
const COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL || "comercial@projem.com.br";

const PROJECTS = [
  {
    id: "industrial",
    label: "Industrial",
    icon: "factory",
    title: "Instalações elétricas industriais",
    lead: "Execução elétrica para operações que não podem depender de improviso, gambiarra ou manutenção corretiva constante.",
    image: "/assets/projeto-industrial.svg",
    projects: [
      { title: "Máquinas e pontos de força", text: "Alimentação elétrica, distribuição e preparação para novos equipamentos." },
      { title: "Quadros e circuitos", text: "Organização de cargas, proteção, identificação e expansão elétrica planejada." },
      { title: "Adequações em operação", text: "Correção de instalações existentes sem transformar a obra em uma sequência de remendos." },
    ],
  },
  {
    id: "agro",
    label: "Agro",
    icon: "agro",
    title: "Soluções elétricas para o agro",
    lead: "Instalações para propriedades, galpões, armazéns, irrigação e estruturas produtivas que exigem disponibilidade.",
    image: "/assets/projeto-agro.svg",
    projects: [
      { title: "Galpões e propriedades", text: "Iluminação, força, painéis, motores e infraestrutura para rotina produtiva." },
      { title: "Armazenagem e produção", text: "Estrutura elétrica para uso contínuo, expansão e redução de falhas operacionais." },
      { title: "Modernização elétrica", text: "Organização técnica de instalações antigas antes de receber novas cargas." },
    ],
  },
  {
    id: "infraestrutura",
    label: "Infraestrutura",
    icon: "tower",
    title: "Infraestrutura para crescimento elétrico",
    lead: "Base técnica para crescer sem sobrecarregar a rede, travar a operação ou refazer serviço depois.",
    image: "/assets/projeto-infra.svg",
    projects: [
      { title: "Entrada de energia", text: "Estrutura de medição, alimentação e adequação para padrão da concessionária." },
      { title: "Distribuição de carga", text: "Dimensionamento para evitar gargalos, quedas, aquecimento e falhas recorrentes." },
      { title: "Expansão planejada", text: "Preparação para novas máquinas, novos setores e aumento de demanda." },
    ],
  },
  {
    id: "projeto",
    label: "Projeto técnico",
    icon: "plan",
    title: "Planejamento elétrico antes da execução",
    lead: "Levantamento, dimensionamento e escopo claro para reduzir decisão improvisada em campo.",
    image: "/assets/projeto-planejamento.svg",
    projects: [
      { title: "Levantamento de necessidade", text: "Análise da estrutura, carga prevista, ambiente e uso real da instalação." },
      { title: "Dimensionamento", text: "Definição técnica da solução compatível com segurança, carga e crescimento." },
      { title: "Direcionamento de obra", text: "Execução com escopo, prioridades e critérios claros para a equipe." },
    ],
  },
];

const CLIENT_LOGOS = [
  { src: "/assets/cliente-giongo-hammel-mono-transparent.png", alt: "Giongo & Hammel Agropecuária" },
  { src: "/assets/cliente-fazenda-galore-mono-transparent.png", alt: "Fazenda Galore" },
  { src: "/assets/cliente-cegil-mono-transparent.png", alt: "CEGIL" },
  { src: "/assets/cliente-crvr-mono-transparent.png", alt: "CRVR" },
];

const PROBLEMS = [
  { icon: "factory", title: "Vai instalar máquina ou equipamento novo", text: "A análise define se a rede, os circuitos e o quadro suportam a carga antes da ligação." },
  { icon: "tower", title: "Precisa ampliar, adequar ou regularizar a entrada de energia", text: "A Projem avalia padrão, alimentação, medição e exigências técnicas para evitar retrabalho." },
  { icon: "bolt", title: "A operação já apresenta queda, aquecimento ou disjuntor desarmando", text: "Esses sinais indicam que a estrutura elétrica precisa ser revisada antes de receber novas demandas." },
  { icon: "plan", title: "A obra precisa sair do papel com escopo claro", text: "Levantamento e dimensionamento reduzem decisões improvisadas durante a execução." },
];

const PROCESS = [
  { n: "01", icon: "search", title: "Diagnóstico", text: "Entendimento da demanda, estrutura, carga, urgência e condições reais do local." },
  { n: "02", icon: "plan", title: "Escopo técnico", text: "Definição do que será feito, prioridade, materiais críticos e caminho de execução." },
  { n: "03", icon: "bolt", title: "Execução", text: "Equipe em campo com orientação técnica, organização e controle da instalação." },
  { n: "04", icon: "check", title: "Entrega", text: "Validação final, orientação de uso e instalação pronta para a operação prevista." },
];

const FORM_NEEDS = [
  "Instalação elétrica completa",
  "Adequação de estrutura existente",
  "Ampliação para novos equipamentos",
  "Quadros e distribuição",
  "Entrada de energia",
  "Projeto elétrico",
  "Outra demanda elétrica",
];

const FORM_SEGMENTS = [
  { id: "industrial", title: "Industrial", desc: "Máquinas, fábrica, oficina, linha produtiva ou operação com carga relevante.", icon: "factory" },
  { id: "agro", title: "Agro", desc: "Propriedade rural, galpão, armazém, irrigação, motores ou produção.", icon: "agro" },
  { id: "comercial", title: "Comercial / Infra", desc: "Comércio, estrutura técnica, entrada de energia, ampliação ou adequação.", icon: "tower" },
];

const FORM_PRIORITIES = [
  { id: "urgente", title: "Urgente", desc: "Precisa resolver agora ou nos próximos dias." },
  { id: "prazo", title: "Tenho prazo", desc: "Existe obra, máquina, ampliação ou data prevista." },
  { id: "planejamento", title: "Planejamento", desc: "Ainda estou comparando caminhos e levantando viabilidade." },
];

const initialLead = {
  need: "",
  needOther: "",
  segment: "",
  priority: "",
  name: "",
  phone: "",
  company: "",
  email: "",
  city: "",
  lat: "",
  lng: "",
  comment: "",
  consent: true,
};

function Icon({ name }) {
  const common = { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true" };

  if (name === "factory") return <svg {...common}><path d="M3.5 20.5V9.2l5.2 3.1V9.2l5.1 3V6.1l6.7-2.6v17H3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M7.4 20.5v-4h3.2v4M14 20.5v-4h3.2v4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  if (name === "agro") return <svg {...common}><path d="M4 20c1.25-5.3 4.6-8.9 10-10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M6.2 14.5c-1.2-3.25.2-6.3 4.25-9.1 2.9 3.8 2.35 7.2-.95 10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M13.3 10c2.3-2.7 5-3.4 7.8-2.1-.65 4-3 6-7 6.15" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  if (name === "tower") return <svg {...common}><path d="M12 3.2 6.2 21M12 3.2 17.8 21M8.3 14.1h7.4M9.5 10.2h5M10.4 6.5h3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 7.7h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  if (name === "plan") return <svg {...common}><path d="M5 4.2h14v15.6H5V4.2Z" stroke="currentColor" strokeWidth="1.7"/><path d="M8.2 8.2h7.6M8.2 12h5M8.2 15.8h7.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  if (name === "search") return <svg {...common}><path d="M10.7 17.4a6.7 6.7 0 1 0 0-13.4 6.7 6.7 0 0 0 0 13.4ZM15.7 15.7 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "bolt") return <svg {...common}><path d="M13 2.8 5.8 13h5.3L10 21.2 18.5 9.4h-5.8L13 2.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  if (name === "check") return <svg {...common}><path d="M20 6.8 9.5 17.2 4 11.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return null;
}

function WhatsappIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16.03 4.1c-6.55 0-11.88 5.29-11.88 11.8 0 2.08.55 4.12 1.6 5.91L4 28l6.36-1.67a11.93 11.93 0 0 0 5.67 1.43c6.55 0 11.88-5.29 11.88-11.8S22.58 4.1 16.03 4.1Zm0 21.64c-1.86 0-3.68-.52-5.25-1.5l-.38-.23-3.77.99 1.01-3.64-.25-.4a9.74 9.74 0 0 1-1.5-5.06c0-5.39 4.54-9.78 10.13-9.78 5.58 0 10.12 4.39 10.12 9.78 0 5.4-4.54 9.84-10.12 9.84Zm5.55-7.35c-.3-.15-1.8-.88-2.08-.98-.28-.1-.48-.15-.68.15-.2.29-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.13 3.23 5.17 4.52.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.8-.73 2.05-1.43.25-.7.25-1.31.18-1.43-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function FloatingIcons() {
  const icons = ["factory", "agro", "tower", "plan", "bolt", "check"];
  return <div className="floating-icons" aria-hidden="true">{icons.map((name, index) => <span className={`float-icon float-icon-${index + 1}`} key={name}><Icon name={name} /></span>)}</div>;
}

function useReveal(routeKey) {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [routeKey]);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isPhone(value) {
  const digits = onlyDigits(value);
  if (digits.length < 10 || digits.length > 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isEmail(value) {
  const email = String(value || "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveNeed(form) {
  return form.need || "";
}

const FORM_STEP_TITLES = {
  1: "Demanda",
  2: "Ambiente",
  3: "Prioridade",
  4: "Contato",
  5: "Confirmação",
};

function validateFormStep(step, form) {
  if (step === 1) return Boolean(form.need);
  if (step === 2) return Boolean(form.segment);
  if (step === 3) return Boolean(form.priority);
  if (step === 4) return Boolean(form.name.trim() && isPhone(form.phone) && form.city.trim() && isEmail(form.email));
  if (step === 5) return true;
  return true;
}

function getStepError(step, form) {
  if (step === 1) return "Escolha a necessidade principal da instalação.";
  if (step === 2) return "Escolha o tipo de ambiente da instalação.";
  if (step === 3) return "Escolha a prioridade da demanda.";
  if (step === 4) {
    if (!form.name.trim()) return "Informe seu nome.";
    if (!isPhone(form.phone)) return "Informe um telefone válido com DDD.";
    if (!form.city.trim()) return "Informe a cidade da instalação.";
    if (!isEmail(form.email)) return "O email informado não parece válido. Corrija ou deixe em branco.";
  }
  return "Complete os campos obrigatórios antes de avançar.";
}

function SummaryLine({ label, value }) {
  return <div className="summary-line"><span>{label}</span><strong>{value || "—"}</strong></div>;
}

function Header({ onOpenForm, onWhatsapp, onRoute }) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <a className="brand" href="/" onClick={(event) => onRoute(event, "/")} aria-label="Projem Engenharia Elétrica">
          <img src="/assets/projem-logo-branca.png" alt="Projem" />
        </a>
        <nav className="topnav" aria-label="Navegação principal">
          <a href="/#inicio" onClick={(event) => onRoute(event, "/", "inicio")}>Início</a>
          <a href="/#diagnostico" onClick={(event) => onRoute(event, "/", "diagnostico")}>Diagnóstico</a>
          <a href="/#processo" onClick={(event) => onRoute(event, "/", "processo")}>Processo</a>
          <a href="/privacidade" onClick={(event) => onRoute(event, "/privacidade")}>Privacidade</a>
        </nav>
        <button className="nav-whatsapp" type="button" onClick={onWhatsapp}>
          <WhatsappIcon />
          <span>WhatsApp</span>
        </button>
      </div>
    </header>
  );
}

function Hero({ activeIndex, setActiveIndex, onOpenForm }) {
  const activeProject = PROJECTS[activeIndex];
  return (
    <section className="hero" id="inicio">
      <FloatingIcons />
      <div className="container hero-inner">
        <div className="hero-copy" data-reveal>
          <p className="hero-kicker">PROJEM ENGENHARIA ELÉTRICA</p>
          <h1>Instalação elétrica sem improviso para indústria e agro.</h1>
          <p>Projeto, execução e adequação para máquinas, galpões, entradas de energia, quadros e estruturas produtivas que precisam operar com segurança.</p>
          <button className="hero-cta" type="button" onClick={onOpenForm}>Solicitar análise técnica</button>
        </div>

        <div className="client-rail" aria-label="Clientes atendidos" data-reveal>
          <div className="rail-fade rail-left" />
          <div className="rail-fade rail-right" />
          <div className="client-track">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, index) => (
              <img key={`${logo.src}-${index}`} src={logo.src} alt={logo.alt} />
            ))}
          </div>
        </div>

        <div className="project-stage" data-reveal>
          <div className="selector-bar" aria-label="Selecionar tipo de projeto">
            {PROJECTS.map((project, index) => (
              <button key={project.id} type="button" className={`selector-pill ${activeIndex === index ? "active" : ""}`} onClick={() => setActiveIndex(index)}>
                <span className="selector-icon"><Icon name={project.icon} /></span>
                <span>{project.label}</span>
              </button>
            ))}
          </div>

          <div className="project-popup always-open">
            <div className="popup-topline">
              <div className="popup-dots" aria-hidden="true"><span /><span /><span /></div>
              <p>janela de projetos</p>
            </div>
            <div className="project-popup-grid">
              <div className="project-image"><img src={activeProject.image} alt={activeProject.title} /></div>
              <div className="project-content">
                <h2>{activeProject.title}</h2>
                <p>{activeProject.lead}</p>
                <div className="project-list">
                  {activeProject.projects.map((item) => (
                    <article className="project-row" key={item.title}><span /><div><strong>{item.title}</strong><p>{item.text}</p></div></article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection({ onOpenForm }) {
  return (
    <section className="section white-section" id="diagnostico">
      <div className="container problem-layout">
        <div className="section-title" data-reveal>
          <span className="eyebrow-dark">análise técnica</span>
          <h2>Quando a elétrica precisa entrar no planejamento.</h2>
          <p>Antes de ligar uma máquina, ampliar um galpão ou adequar uma entrada de energia, é preciso saber se a estrutura suporta a demanda real.</p>
          <button className="dark-cta" type="button" onClick={onOpenForm}>Solicitar análise da estrutura</button>
        </div>
        <div className="problem-grid">
          {PROBLEMS.map((item) => (
            <article className="problem-card" data-reveal key={item.title}>
              <i><Icon name={item.icon} /></i>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeliverySection() {
  return (
    <section className="section dark-section" id="atuacao">
      <div className="container split-grid">
        <div className="section-title narrow" data-reveal>
          <span className="eyebrow-yellow">controle de execução</span>
          <h2>Do levantamento à entrega, cada etapa precisa ter critério técnico.</h2>
          <p>A Projem atua para transformar a demanda elétrica em escopo claro: carga prevista, pontos críticos, materiais, prioridades e execução em campo.</p>
        </div>
        <div className="proof-panel" data-reveal>
          <strong>O que a equipe avalia antes de executar</strong>
          <ul>
            <li>Carga prevista e equipamentos que serão alimentados.</li>
            <li>Condição dos quadros, circuitos, entrada e distribuição.</li>
            <li>Prioridade da operação: urgência, expansão ou planejamento.</li>
            <li>Possíveis pontos de retrabalho em estruturas antigas, ampliadas ou sem documentação clara.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="section process-section" id="processo">
      <div className="container">
        <div className="section-title narrow" data-reveal>
          <span className="eyebrow-yellow">processo</span>
          <h2>Como o trabalho avança</h2>
          <p>Da leitura técnica da estrutura até a entrega da instalação em campo.</p>
        </div>
        <div className="process-grid">
          {PROCESS.map((item) => (
            <article className="process-item" key={item.n} data-reveal>
              <div className="process-head"><span>{item.n}</span><i><Icon name={item.icon} /></i></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onOpenForm }) {
  return (
    <section className="final-cta-section">
      <div className="container final-cta-card" data-reveal>
        <div>
          <span className="eyebrow-yellow">próximo passo</span>
          <h2>Antes de orçar, entenda o que precisa ser dimensionado.</h2>
          <p>Envie a demanda inicial. A equipe recebe os dados organizados e segue o contato pelo WhatsApp.</p>
        </div>
        <button className="hero-cta" type="button" onClick={onOpenForm}>Iniciar análise técnica</button>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      question: "A Projem faz apenas projeto ou também executa a instalação?",
      answer: "A Projem atua com análise técnica, direcionamento da solução e execução elétrica em campo. O escopo depende da necessidade da estrutura, do tipo de carga e da etapa da obra.",
    },
    {
      question: "Vocês atendem indústria e propriedade rural?",
      answer: "Sim. A LP está direcionada para demandas industriais, agro, comerciais e de infraestrutura elétrica: máquinas, galpões, quadros, ampliações, entrada de energia e adequações.",
    },
    {
      question: "Preciso ter um projeto pronto antes de chamar a Projem?",
      answer: "Não necessariamente. O primeiro contato serve justamente para entender a demanda, identificar o ambiente, a prioridade e os dados mínimos para orientar o próximo passo técnico.",
    },
    {
      question: "Dá para fazer orçamento só pelo WhatsApp?",
      answer: "O WhatsApp inicia o atendimento, mas instalações elétricas produtivas geralmente exigem contexto técnico. Por isso o formulário coleta o essencial antes do contato.",
    },
    {
      question: "A Projem atende entrada de energia e adequações?",
      answer: "Sim. A equipe pode avaliar demandas de entrada de energia, distribuição, quadros, circuitos, ampliação de carga e adequações para novas necessidades da estrutura.",
    },
  ];

  return (
    <section className="section white-section faq-section" id="faq">
      <div className="container faq-layout">
        <div className="section-title" data-reveal>
          <span className="eyebrow-dark">perguntas frequentes</span>
          <h2>Dúvidas comuns antes de solicitar uma análise.</h2>
          <p>Respostas diretas para entender quando faz sentido chamar a Projem e quais informações ajudam no primeiro contato.</p>
        </div>
        <div className="faq-list" data-reveal>
          {faqs.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ onRoute }) {
  return (
    <footer className="footer" id="rodape">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/projem-logo-branca.png" alt="Projem" />
          <p>Engenharia elétrica para estruturas produtivas.</p>
          <small>Industrial, agro, infraestrutura elétrica e adequações técnicas.</small>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <p>{COMPANY_EMAIL}</p>
          <p>WhatsApp: +55 55 9968-6302</p>
        </div>
        <div className="footer-col">
          <h4>Dados</h4>
          <p>CNPJ: {COMPANY_CNPJ}</p>
          <p>Atendimento em Santa Rosa/RS e região.</p>
        </div>
        <div className="footer-col footer-data">
          <h4>Privacidade</h4>
          <p>Os dados enviados são usados para contato comercial e análise inicial da demanda.</p>
          <a href="/privacidade" onClick={(event) => onRoute(event, "/privacidade")}>Ver política de privacidade</a>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Projem Engenharia Elétrica.</span><span>LP otimizada para captação técnica.</span></div>
    </footer>
  );
}

function LeadWizard({ open, onClose, attribution }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialLead);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => modalRef.current?.focus(), 80);
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape" && !sending) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, sending, onClose]);

  if (!open) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function closeAndReset() {
    if (sending) return;
    onClose();
    window.setTimeout(() => {
      setStep(1);
      setForm(initialLead);
      setError("");
      setSuccess(false);
      setWhatsappUrl("");
      setFallbackUrl("");
      setLocationStatus("");
    }, 180);
  }

  function nextStep() {
    if (!validateFormStep(step, form)) {
      setError(getStepError(step, form));
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 5));
  }

  function prevStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function fillCity(latitude, longitude) {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
      if (!response.ok) throw new Error("reverse_geocode_failed");
      const data = await response.json();
      const detectedCity = data.city || data.locality || data.principalSubdivision || "";
      setForm((current) => ({ ...current, city: detectedCity || current.city }));
      setLocationStatus(detectedCity ? `Cidade detectada: ${detectedCity}.` : "Localização capturada. Digite a cidade manualmente.");
    } catch {
      setLocationStatus("Localização capturada, mas a cidade não foi identificada. Digite manualmente.");
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Localização indisponível neste navegador.");
      return;
    }
    setLocationStatus("Capturando localização...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const lng = String(position.coords.longitude);
        setForm((current) => ({ ...current, lat, lng }));
        fillCity(lat, lng);
      },
      () => setLocationStatus("Não foi possível capturar. Digite a cidade manualmente."),
      { enableHighAccuracy: false, timeout: 9000 }
    );
  }

  function buildMessage(eventId) {
    const need = resolveNeed(form);
    return [
      `Olá! Enviei uma solicitação pelo site da Projem.`,
      `Protocolo: ${eventId}`,
      `Nome: ${form.name.trim()}`,
      `Telefone: ${form.phone.trim()}`,
      `Cidade: ${form.city.trim()}`,
      `Necessidade: ${need}`,
      `Segmento: ${form.segment}`,
      `Prioridade: ${form.priority}`,
      form.company.trim() ? `Empresa/propriedade: ${form.company.trim()}` : "",
      form.comment.trim() ? `Comentário: ${form.comment.trim()}` : "",
    ].filter(Boolean).join("\n");
  }

  async function submit(event) {
    event.preventDefault();

    for (let i = 1; i <= 4; i += 1) {
      if (!validateFormStep(i, form)) {
        setStep(i);
        setError(getStepError(i, form));
        return;
      }
    }

    const eventId = createEventId("lead");
    const need = resolveNeed(form);
    const phoneDigits = onlyDigits(form.phone);
    const message = buildMessage(eventId);
    const nextWhatsappUrl = buildWhatsAppUrl({ number: WHATSAPP_NUMBER, message });

    setSending(true);
    setError("");
    setFallbackUrl(nextWhatsappUrl);

    const payload = {
      lead_id: eventId,
      event_name: "generate_lead",
      origem_formulario: "lp_projem_engenharia_eletrica_otimizada",
      area_foco: "industrial_agro_instalacoes_eletricas",
      necessidade: need,
      segmento: form.segment,
      prioridade: form.priority,
      nome: form.name.trim(),
      telefone: phoneDigits,
      telefone_original: form.phone.trim(),
      empresa_ou_propriedade: form.company.trim(),
      email: form.email.trim(),
      cidade: form.city.trim(),
      latitude: form.lat,
      longitude: form.lng,
      mensagem: form.comment.trim(),
      whatsapp_destino: WHATSAPP_NUMBER,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      ...attribution,
    };

    const trackingPayload = {
      lead_id: eventId,
      origem_formulario: payload.origem_formulario,
      area_foco: payload.area_foco,
      necessidade: payload.necessidade,
      segmento: payload.segmento,
      prioridade: payload.prioridade,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      gclid: attribution.gclid,
      fbclid: attribution.fbclid,
      page_path: attribution.page_path,
    };

    try {
      trackEvent("lead_submit_attempt", trackingPayload, eventId);
      const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 700));
      await Promise.all([sendLeadToEndpoint(payload), minimumDelay]);
      trackEvent("generate_lead", trackingPayload, eventId);
      setWhatsappUrl(nextWhatsappUrl);
      setSuccess(true);
      setForm(initialLead);
      setStep(5);
    } catch (submitError) {
      console.error(submitError);
      setError("O envio automático falhou. Para não perder o atendimento, clique em 'Enviar pelo WhatsApp' abaixo.");
      trackEvent("lead_submit_error", {
        error_message: submitError?.message || "unknown_error",
        origem_formulario: payload.origem_formulario,
        area_foco: payload.area_foco,
        necessidade: payload.necessidade,
        segmento: payload.segmento,
        prioridade: payload.prioridade,
        page_path: attribution.page_path,
      }, eventId);
    } finally {
      setSending(false);
    }
  }

  function openWhatsappFromModal(url = whatsappUrl || fallbackUrl) {
    if (!url) return;
    const eventId = createEventId("whatsapp");
    trackEvent("whatsapp_click", { origin: success ? "lead_success" : "lead_error", page_path: attribution.page_path }, eventId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="wizard-overlay" role="dialog" aria-modal="true" aria-label="Formulário de análise técnica" onMouseDown={closeAndReset}>
      <div className="wizard-modal optimized-modal" ref={modalRef} tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
        <button className="wizard-close" type="button" onClick={closeAndReset} aria-label="Fechar formulário">×</button>

        {success ? (
          <div className="success-screen">
            <div className="success-mark large">✓</div>
            <span className="eyebrow-dark">solicitação recebida</span>
            <h2>Dados enviados. Agora continue pelo WhatsApp.</h2>
            <p>O envio automático foi concluído. Clique no botão abaixo para abrir a conversa já com o resumo da solicitação.</p>
            <div className="success-screen-actions">
              <button className="whatsapp-solid" type="button" onClick={() => openWhatsappFromModal()}><WhatsappIcon /> Abrir WhatsApp</button>
              <button className="back-button" type="button" onClick={closeAndReset}>Fechar</button>
            </div>
          </div>
        ) : (
          <form className="wizard-form separated-wizard" onSubmit={submit}>
            <div className="wizard-intro slim-intro">
              <div>
                <span className="eyebrow-dark">análise técnica</span>
                <h2>{FORM_STEP_TITLES[step]}</h2>
              </div>
              <div className="step-progress five-steps" aria-label="Progresso do formulário">
                {[1, 2, 3, 4, 5].map((item) => (
                  <span key={item} className={item === step ? "active" : item < step ? "done" : ""}>{item}</span>
                ))}
              </div>
            </div>

            {step === 1 ? (
              <section className="wizard-step separated-step">
                <h3>Qual é a necessidade principal?</h3>
                <p className="step-note">Escolha apenas uma opção. Os detalhes ficam para depois.</p>
                <div className="choice-list block-choices separated-choices">
                  {FORM_NEEDS.map((need) => (
                    <button className={`choice-option ${form.need === need ? "selected" : ""}`} type="button" key={need} onClick={() => update("need", need)}>
                      {need}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="wizard-step separated-step">
                <h3>Onde será a instalação?</h3>
                <p className="step-note">Esta etapa é somente sobre o tipo de ambiente.</p>
                <div className="segment-grid three separated-segments">
                  {FORM_SEGMENTS.map((segment) => (
                    <button className={`segment-option ${form.segment === segment.title ? "selected" : ""}`} type="button" key={segment.id} onClick={() => update("segment", segment.title)}>
                      <span><Icon name={segment.icon} /></span>
                      <strong>{segment.title}</strong>
                      <p>{segment.desc}</p>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="wizard-step separated-step">
                <h3>Qual é a prioridade?</h3>
                <p className="step-note">Aqui não há campo de texto. A prioridade ajuda a equipe a organizar o retorno.</p>
                <div className="priority-list separated-priority">
                  {FORM_PRIORITIES.map((priority) => (
                    <button className={`priority-option ${form.priority === priority.title ? "selected" : ""}`} type="button" key={priority.id} onClick={() => update("priority", priority.title)}>
                      <strong>{priority.title}</strong>
                      <p>{priority.desc}</p>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {step === 4 ? (
              <section className="wizard-step separated-step">
                <h3>Dados para retorno</h3>
                <p className="step-note">Agora sim entram os campos de preenchimento. Nome, telefone e cidade são obrigatórios.</p>
                <div className="form-grid contact-grid">
                  <label className="input-field"><span>Nome</span><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Seu nome" autoComplete="name" /></label>
                  <label className="input-field"><span>Telefone</span><input value={form.phone} onChange={(event) => update("phone", formatPhone(event.target.value))} placeholder="(55) 99999-9999" autoComplete="tel" inputMode="tel" /></label>
                </div>
                <div className="city-group spacing-top">
                  <label className="input-field"><span>Cidade da instalação</span><input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Ex.: Santa Rosa" autoComplete="address-level2" /></label>
                  <button className="location-button secondary-location" type="button" onClick={detectLocation}>Usar localização</button>
                </div>
                {locationStatus ? <p className="location-status">{locationStatus}</p> : null}
                <div className="form-grid optional-grid spacing-top">
                  <label className="input-field"><span>Empresa / propriedade <small>(opcional)</small></span><input value={form.company} onChange={(event) => update("company", event.target.value)} placeholder="Nome da empresa ou propriedade" autoComplete="organization" /></label>
                  <label className="input-field"><span>Email <small>(opcional)</small></span><input value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="email@empresa.com.br" autoComplete="email" /></label>
                </div>
                <label className="input-field spacing-top"><span>Observação <small>(opcional)</small></span><textarea value={form.comment} onChange={(event) => update("comment", event.target.value)} placeholder="Ex.: máquina nova, quadro antigo, entrada de energia, obra em andamento..." /></label>
              </section>
            ) : null}

            {step === 5 ? (
              <section className="wizard-step separated-step">
                <h3>Revisar e enviar</h3>
                <p className="step-note">Confira o resumo. Ao enviar, a Projem usa estes dados apenas para contato comercial e análise inicial da solicitação.</p>
                <div className="summary-box compact-summary">
                  <SummaryLine label="Necessidade" value={resolveNeed(form)} />
                  <SummaryLine label="Ambiente" value={form.segment} />
                  <SummaryLine label="Prioridade" value={form.priority} />
                  <SummaryLine label="Cidade" value={form.city} />
                  <SummaryLine label="Nome" value={form.name} />
                  <SummaryLine label="Telefone" value={form.phone} />
                  <SummaryLine label="Empresa / propriedade" value={form.company} />
                  <SummaryLine label="Email" value={form.email} />
                  <SummaryLine label="Observação" value={form.comment} />
                </div>
                <p className="privacy-inline">Dados pessoais não são enviados para GA4, Meta Pixel ou dataLayer. O envio técnico segue para atendimento da Projem.</p>
              </section>
            ) : null}

            {error ? <div className="wizard-error" role="alert">{error}{fallbackUrl ? <button className="error-whatsapp" type="button" onClick={() => openWhatsappFromModal(fallbackUrl)}>Enviar pelo WhatsApp</button> : null}</div> : null}

            <div className="wizard-footer">
              <button className="back-button" type="button" onClick={step === 1 ? closeAndReset : prevStep} disabled={sending}>{step === 1 ? "Fechar" : "Voltar"}</button>
              {step < 5 ? <button className="next-button" type="button" onClick={nextStep} disabled={sending}>Avançar</button> : <button className={`send-button ${sending ? "sending" : ""}`} type="submit" disabled={sending}><span className="send-fill" /><span className="send-label">{sending ? "Enviando..." : "Enviar solicitação"}</span></button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PrivacyPage({ onRoute }) {
  useEffect(() => {
    document.title = "Política de Privacidade | Projem Engenharia Elétrica";
  }, []);

  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="container privacy-card" data-reveal>
          <span className="eyebrow-yellow">privacidade</span>
          <h1>Política de privacidade da LP Projem Engenharia Elétrica</h1>
          <p>Esta página resume como os dados enviados pelo formulário são usados para atendimento comercial e análise inicial da demanda.</p>
          <a className="privacy-back" href="/" onClick={(event) => onRoute(event, "/")}>Voltar para a página inicial</a>
        </div>
      </section>
      <section className="section white-section">
        <div className="container privacy-content" data-reveal>
          <h2>1. Dados coletados</h2>
          <p>O formulário pode coletar nome, telefone, cidade, empresa ou propriedade, email opcional, tipo de necessidade, prioridade, comentário e dados de origem da visita, como UTMs e página de referência.</p>
          <h2>2. Finalidade</h2>
          <p>Os dados são usados para contato comercial, triagem da solicitação, organização de leads e análise inicial de demandas relacionadas a instalações elétricas, projetos, entradas de energia e adequações.</p>
          <h2>3. Geolocalização</h2>
          <p>A localização só é usada quando o visitante aciona voluntariamente o botão de localização. O objetivo é preencher ou auxiliar o campo de cidade.</p>
          <h2>4. Compartilhamento</h2>
          <p>Os dados podem ser encaminhados para ferramentas internas de atendimento e automação, como planilhas, webhooks e canais de notificação usados pela equipe da Projem. Eles não devem ser vendidos a terceiros.</p>
          <h2>5. Métricas e anúncios</h2>
          <p>Eventos de mídia podem ser enviados para ferramentas de mensuração, mas dados pessoais como nome, telefone, email e localização precisa são removidos dos eventos de tracking da LP.</p>
          <h2>6. Solicitações</h2>
          <p>Para solicitar correção ou remoção de dados, entre em contato pelo email {COMPANY_EMAIL}.</p>
        </div>
      </section>
    </main>
  );
}

function HomePage({ activeIndex, setActiveIndex, onOpenForm }) {
  return (
    <main>
      <Hero activeIndex={activeIndex} setActiveIndex={setActiveIndex} onOpenForm={onOpenForm} />
      <ProblemSection onOpenForm={onOpenForm} />
      <DeliverySection />
      <ProcessSection />
      <FinalCta onOpenForm={onOpenForm} />
      <FaqSection />
    </main>
  );
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname || "/");
  const attribution = useMemo(() => getAttribution(), [route]);
  useReveal(route);

  useEffect(() => {
    initTracking();
  }, []);

  useEffect(() => {
    trackEvent("view_landing_page", { page_type: route === "/privacidade" ? "privacy" : "lp_engenharia_eletrica", focus: "industrial_agro", ...attribution });
  }, [route, attribution]);

  useEffect(() => {
    if (route !== "/") return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % PROJECTS.length), 5200);
    return () => window.clearInterval(timer);
  }, [route]);

  useEffect(() => {
    function onPopState() { setRoute(window.location.pathname || "/"); }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(event, path, hash = "") {
    event?.preventDefault?.();
    const nextPath = path || "/";
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath + (hash ? `#${hash}` : ""));
    setRoute(nextPath);
    window.setTimeout(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 40);
  }

  function openForm() {
    setFormOpen(true);
    trackEvent("form_open", { origin: "cta", page_path: attribution.page_path, utm_source: attribution.utm_source, utm_medium: attribution.utm_medium, utm_campaign: attribution.utm_campaign });
  }

  function handleWhatsapp() {
    const eventId = createEventId("whatsapp");
    trackEvent("whatsapp_click", { origin: "nav", page_path: attribution.page_path }, eventId);
    window.open(buildWhatsAppUrl({ number: WHATSAPP_NUMBER, message: "Olá! Quero falar com a Projem Engenharia Elétrica." }), "_blank", "noopener,noreferrer");
  }

  const isPrivacy = route === "/privacidade";

  return (
    <div className="site-shell">
      <Header onOpenForm={openForm} onWhatsapp={handleWhatsapp} onRoute={navigate} />
      {isPrivacy ? <PrivacyPage onRoute={navigate} /> : <HomePage activeIndex={activeIndex} setActiveIndex={setActiveIndex} onOpenForm={openForm} />}
      <Footer onRoute={navigate} />
      <LeadWizard open={formOpen} onClose={() => setFormOpen(false)} attribution={attribution} />
    </div>
  );
}
