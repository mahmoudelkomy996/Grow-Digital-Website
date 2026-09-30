// Shared scroll-story scaffold for the 3D homepage prototypes (throwaway spike).
// A prototype page calls initStory({ name, createScene }) where createScene is exported by its scene module.
//
// Scene contract:
//   createScene({ canvas, reducedMotion, isMobile, chapters, logoUrl }) -> scene | Promise<scene>
//   scene.resize(width, height, dpr)   // CSS pixels + capped devicePixelRatio
//   scene.render(timeSeconds, p)        // p = story progress 0..1 (see segment() for chapter mapping)
//
// Debug URL params: ?p=0.42 freezes progress (used by the screenshot tool), ?debug=1 shows fps.

export const CHAPTERS = [
  {
    id: "intro", num: "00", name: "Grow Digital", full: "The agile integrator",
    title: "It's time to <em>grow</em>.",
    lead: "One accountable team that designs, builds, operates and markets the systems your revenue depends on.",
    chips: [], hint: "Scroll to begin the journey",
  },
  {
    id: "consult", num: "01", name: "Consult", full: "Consulting & Advisory",
    title: "Direction before <em>investment</em>.",
    lead: "Strategy, architecture and governance that turn transformation into an executive-aligned roadmap.",
    chips: ["Digital Transformation Strategy", "IT Strategy & Roadmap", "Enterprise Architecture", "PMO & Program Management"],
  },
  {
    id: "transform", num: "02", name: "Transform", full: "Data, AI & IoT",
    title: "Data into <em>decisions</em>.",
    lead: "Predictive models, AI agents and IoT platforms that hold up in production, not just in a demo.",
    chips: ["Data Strategy & Governance", "Generative AI & AI Agents", "Predictive Analytics & ML", "IoT Platforms"],
  },
  {
    id: "build", num: "03", name: "Build", full: "Software Development & Digital Experience",
    title: "Software people <em>finish</em> using.",
    lead: "Web, mobile and custom applications measured on load time and conversion, not screenshots.",
    chips: ["Web & Mobile Apps", "Custom Applications", "UX/UI Design", "API & Integration"],
  },
  {
    id: "operate", num: "04", name: "Operate", full: "Managed Services",
    title: "Systems that never <em>sleep</em>.",
    lead: "SLA-based L1–L3 support, cloud operations and monitoring that keep revenue systems running.",
    chips: ["Cloud Managed Services", "Application Support", "Infrastructure Monitoring", "GrowShield™"],
  },
  {
    id: "secure", num: "05", name: "Secure", full: "Cybersecurity",
    title: "Defense shaped to your <em>risk</em>.",
    lead: "Security built around your actual attack surface, with 24/7 vigilance and governance you can audit.",
    chips: ["Strategy & Roadmap", "Assessment & Audit", "GRC & Compliance", "Incident Response"],
  },
  {
    id: "solve", num: "06", name: "Solve", full: "Digital, Cloud & AI Solutions",
    title: "Products that deliver <em>value</em>.",
    lead: "Our own AI platforms plus partner solutions we exclusively represent in KSA and the UAE.",
    chips: ["Grow Bot", "Medical Decision Intelligence", "ATHAR EMR", "InCommerce by Inveon", "OneStore by Mobilgi"],
  },
  {
    id: "grow", num: "07", name: "Grow", full: "Marketing & Growth",
    title: "Growth you can <em>measure</em>.",
    lead: "Strategy, performance marketing and GrowthLab analytics pulled together, with no siloed tactics.",
    chips: ["Digital Marketing Strategy", "Performance Marketing", "GrowthLab Analytics", "Go-to-Market"],
  },
  {
    id: "finale", num: "", name: "", full: "",
    title: "Consult. Transform. Build.<br>Operate. Secure. <em>Grow</em>.",
    lead: "Supported by our own digital and AI solutions, for enterprises across KSA and the UAE.",
    chips: [], cta: "Start the conversation",
  },
];

export const PROTOTYPES = [
  { id: "tree", label: "Tree" },
  { id: "city", label: "City" },
  { id: "arc", label: "Arc journey" },
];

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;

// Map story progress p (0..1) to chapter index i (0..CHAPTERS.length-1) and local t (0..1 within that chapter).
export function segment(p, n = CHAPTERS.length) {
  const s = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(s));
  return { i, t: clamp(s - i) };
}

function panelHTML(c, i) {
  const eyebrow = c.num && i > 0
    ? `<p class="eyebrow">${c.num} — ${c.name} <span>/ ${c.full}</span></p>`
    : i === 0 ? `<p class="eyebrow">${c.full}</p>` : "";
  const heading = i === 0 ? `<h1>${c.title}</h1>` : `<h2>${c.title}</h2>`;
  const chips = c.chips.length ? `<ul class="chips">${c.chips.map((x) => `<li>${x}</li>`).join("")}</ul>` : "";
  const tail = c.hint ? `<p class="hint">${c.hint} ↓</p>`
    : c.cta ? `<a class="cta" href="#">${c.cta} →</a>`
    : `<a class="link" href="#">Explore ${c.name} →</a>`;
  const logo = c.id === "finale" ? `<div class="finale-logo" role="img" aria-label="grow digital"></div>` : "";
  return `<article class="panel" data-i="${i}">${logo}${eyebrow}${heading}<p class="lead">${c.lead}</p>${chips}${tail}</article>`;
}

export async function initStory({ name, createScene }) {
  const params = new URLSearchParams(location.search);
  const frozenP = params.has("p") ? clamp(parseFloat(params.get("p")) || 0) : null;
  const debug = params.has("debug");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = matchMedia("(max-width: 767px)").matches;
  const N = CHAPTERS.length;

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="proto-bar">
      <a class="proto-logo" href="index.html" aria-label="grow digital — prototypes"></a>
      <nav class="proto-switch" aria-label="Prototypes">
        ${PROTOTYPES.map((x) => `<a href="${x.id}.html" ${x.id === name ? 'aria-current="page"' : ""}>${x.label}</a>`).join("")}
      </nav>
    </header>
    <section class="story" id="story" style="height:${N * 110 + 100}vh">
      <div class="stage">
        <canvas id="gl" aria-hidden="true"></canvas>
        <div class="panels">${CHAPTERS.map(panelHTML).join("")}</div>
        <nav class="rail" aria-label="Chapters">
          ${CHAPTERS.slice(1, 8).map((c, k) => `<button data-i="${k + 1}"><span class="name">${c.num} ${c.name}</span><span class="dot"></span></button>`).join("")}
        </nav>
        <div class="progress"></div>
      </div>
    </section>
    <section class="after"><div><h3>End of the ${name} prototype</h3><p>The rest of the homepage continues here.</p></div></section>
    ${debug ? '<div class="debug" id="dbg">…</div>' : ""}
  `);

  const story = document.getElementById("story");
  const canvas = document.getElementById("gl");
  const panels = [...document.querySelectorAll(".panel")];
  const railBtns = [...document.querySelectorAll(".rail button")];
  const bar = document.querySelector(".progress");
  const dbg = document.getElementById("dbg");

  // Smooth scrolling (skipped for reduced motion or frozen screenshots)
  let lenis = null;
  if (!reducedMotion && frozenP === null && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  }

  const range = () => story.offsetHeight - innerHeight;
  const storyTop = () => story.getBoundingClientRect().top + scrollY;
  const readProgress = () => (frozenP !== null ? frozenP : clamp((scrollY - storyTop()) / range()));
  const scrollToChapter = (i) => {
    const y = storyTop() + ((i + 0.5) / N) * range();
    lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  };
  railBtns.forEach((b) => b.addEventListener("click", () => scrollToChapter(+b.dataset.i)));

  let scene;
  try {
    scene = await createScene({ canvas, reducedMotion, isMobile, chapters: CHAPTERS, logoUrl: "shared/logo-paper.png" });
  } catch (err) {
    console.error("Scene failed to initialise", err);
    document.querySelector(".stage").insertAdjacentHTML("beforeend", '<p style="position:absolute;right:24px;bottom:24px;color:#8fcdc6">WebGL unavailable — static fallback would show here.</p>');
    return;
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    scene.resize(canvas.clientWidth, canvas.clientHeight, dpr);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  function updatePanels(p) {
    const s = p * N;
    panels.forEach((el, i) => {
      const local = s - i;
      let o = 0;
      if (local > -0.02 && local < 1.02) {
        const fadeIn = i === 0 ? 1 : clamp(local / 0.16);
        const fadeOut = i === N - 1 ? 1 : clamp((1 - local) / 0.16);
        o = Math.min(fadeIn, fadeOut);
      }
      el.style.opacity = o.toFixed(3);
      el.style.translate = `0 ${((1 - o) * (local < 0.5 ? 24 : -24)).toFixed(1)}px`;
      el.classList.toggle("is-active", o > 0.5);
    });
    const { i } = segment(p);
    railBtns.forEach((b) => b.classList.toggle("is-active", +b.dataset.i === i));
    bar.style.width = `${(p * 100).toFixed(2)}%`;
  }

  let smoothP = readProgress();
  let frames = 0, last = performance.now(), fpsAcc = 0, fpsFrames = 0;
  function tick(now) {
    if (lenis) lenis.raf(now);
    const target = readProgress();
    smoothP = frozenP !== null || reducedMotion ? target : lerp(smoothP, target, 0.12);
    updatePanels(smoothP);
    scene.render(now / 1000, smoothP);
    frames++;
    if (frames === 3) window.__sceneReady = true;
    if (dbg) {
      fpsAcc += now - last; fpsFrames++;
      if (fpsAcc > 500) { dbg.textContent = `${Math.round((fpsFrames * 1000) / fpsAcc)} fps · p=${smoothP.toFixed(3)} · ch ${segment(smoothP).i}`; fpsAcc = 0; fpsFrames = 0; }
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
