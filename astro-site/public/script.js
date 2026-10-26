/* =========================================================
   Spider-Verse Portfolio — interactions & GSAP animations
   ========================================================= */

// ---------- Spider web SVG generator ----------
function buildWeb(spokes, rings) {
  const R = 100;
  const pt = (a, r) => [Math.cos(a) * r, Math.sin(a) * r].map((n) => n.toFixed(2));
  let svg = `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i < spokes; i++) {
    const [x, y] = pt((i / spokes) * Math.PI * 2, R);
    svg += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
  }

  for (let r = 1; r <= rings; r++) {
    const radius = (R * r) / rings;
    let d = "";
    for (let i = 0; i <= spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const [x, y] = pt(a, radius);
      if (i === 0) {
        d += `M${x} ${y}`;
      } else {
        // sag each thread toward the centre like a real web
        const [cx, cy] = pt(a - Math.PI / spokes, radius * 0.82);
        d += ` Q${cx} ${cy} ${x} ${y}`;
      }
    }
    svg += `<path d="${d}" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
  }

  return svg + `</svg>`;
}

document.querySelectorAll("[data-web]").forEach((el) => {
  if (el.firstElementChild) return;
  const [spokes, rings] = el.dataset.web.split(",").map(Number);
  el.innerHTML = buildWeb(spokes, rings);
});

// ---------- Small helpers ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");

if (burger && nav) {
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      nav.classList.remove("open");
    })
  );
}

if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });
}

// ---------- Power card mouse glow ----------
document.querySelectorAll(".power").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ---------- Progressive enhancement ----------
// Content is server-rendered. Animations are optional and must never hide it.
const noAnim = document.documentElement.classList.contains("no-anim");

function cleanup() {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.remove();
  document.body.classList.remove("loading");
}

// Safety net: never let the preloader block the page.
window.setTimeout(cleanup, 5000);

if (noAnim) {
  cleanup();
} else if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  cleanup();
} else {
  try {
    initAnimations();
  } catch (err) {
    console.error(err);
    cleanup();
  }
}

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.add("loading");

  // ---------- Preloader ----------
  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      document.body.classList.remove("loading");
      document.getElementById("preloader").remove();
      ScrollTrigger.refresh();
    },
  });

  intro
    .from(".preloader__web svg", { scale: 0, rotate: -120, duration: 1.1, ease: "expo.out" })
    .from(".preloader__spider", { y: -window.innerHeight, duration: 0.9, ease: "bounce.out" }, "-=0.6")
    .to(".preloader__text", { scale: 1, duration: 0.45, ease: "back.out(3)" }, "-=0.1")
    .to(".preloader__spider", { rotate: 360, scale: 1.3, duration: 0.5, ease: "power2.inOut" }, "<")
    .to("#preloader", { clipPath: "circle(0% at 50% 50%)", duration: 0.8, ease: "expo.inOut" }, "+=0.35")

    // ---------- Hero entrance ----------
    .from(".hero__title .word", { yPercent: 110, duration: 0.9, stagger: 0.12 }, "-=0.35")
    .from(".hero__tag", { y: -30, opacity: 0, duration: 0.6 }, "<0.2")
    .from([".hero__role", ".hero__desc"], { y: 30, opacity: 0, duration: 0.6, stagger: 0.12 }, "<0.2")
    .from(".hero__btns .btn", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, "<0.2")
    .from(".hero__social a", { scale: 0, duration: 0.4, stagger: 0.08, ease: "back.out(3)" }, "<0.2")
    .from(".emblem__web svg", { scale: 0, rotate: 90, duration: 1.2, ease: "expo.out" }, 1.9)
    .from(".emblem__core", { scale: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" }, "<0.2")
    .from(".bubble", { scale: 0, opacity: 0, duration: 0.5, stagger: 0.15, ease: "back.out(3)" }, "<0.4")
    .from("#hangingSpider", { yPercent: -100, duration: 1.2, ease: "bounce.out" }, "<")
    .from(".header", { y: -100, duration: 0.6 }, "<");

  if (reduceMotion) intro.progress(1);

  // ---------- Ambient loops ----------
  gsap.to("#hangingSpider", { rotate: 7, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, startAt: { rotate: -7 } });
  gsap.to(".emblem__web svg", { rotate: 360, duration: 60, ease: "none", repeat: -1 });
  gsap.to(".emblem__ring", { rotate: -360, duration: 30, ease: "none", repeat: -1 });
  gsap.to(".bubble--1", { y: -12, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".bubble--2", { y: 12, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".bubble--3", { y: -10, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".hero__web svg", { rotate: 360, duration: 120, ease: "none", repeat: -1 });
  gsap.to(".marquee__track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

  // hanging spider climbs up as you scroll away from the hero
  gsap.to(".hanging-spider__thread", {
    height: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // hero emblem parallax on mouse move
  const hero = document.querySelector(".hero");
  const emX = gsap.quickTo(".emblem", "x", { duration: 0.8, ease: "power3" });
  const emY = gsap.quickTo(".emblem", "y", { duration: 0.8, ease: "power3" });
  hero.addEventListener("mousemove", (e) => {
    emX((e.clientX / window.innerWidth - 0.5) * 30);
    emY((e.clientY / window.innerHeight - 0.5) * 30);
  });

  // ---------- Scroll-progress spider ----------
  const threadLine = document.getElementById("threadLine");
  const threadSpider = document.getElementById("threadSpider");
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.progress * (window.innerHeight - 30);
      threadLine.style.height = `${y + 4}px`;
      gsap.to(threadSpider, { y, rotate: self.direction > 0 ? 180 : 0, duration: 0.3, overwrite: true });
    },
  });

  // ---------- Reveals ----------
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      rotate: gsap.utils.random(-3, 3),
      duration: 0.9,
      ease: "power3.out",
      immediateRender: false,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.utils.toArray(".reveal-side").forEach((el) => {
    gsap.from(el, {
      x: -80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      immediateRender: false,
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });

  gsap.from(".sfx", {
    scale: 0,
    rotate: -60,
    duration: 0.6,
    ease: "back.out(4)",
    immediateRender: false,
    scrollTrigger: { trigger: ".about__panel", start: "top 70%" },
  });

  gsap.from(".chips span", {
    scale: 0,
    opacity: 0,
    duration: 0.35,
    stagger: 0.02,
    ease: "back.out(2)",
    immediateRender: false,
    scrollTrigger: { trigger: ".skills__grid", start: "top 75%" },
  });

  gsap.from(".comic-strip__item, .comic-strip > i", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.5,
    ease: "back.out(2)",
    immediateRender: false,
    scrollTrigger: { trigger: ".comic-strip", start: "top 85%" },
  });

  // timeline fill
  gsap.to("#timelineFill", {
    height: "100%",
    ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true },
  });

  // rotating webs on scroll
  gsap.to(".results__web svg", {
    rotate: 90,
    ease: "none",
    scrollTrigger: { trigger: ".results", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.to(".contact__web svg", {
    rotate: -90,
    ease: "none",
    scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom bottom", scrub: true },
  });

  // ---------- Language bars ----------
  document.querySelectorAll(".lang__bar i").forEach((bar) => {
    gsap.fromTo(
      bar,
      { width: 0 },
      {
        width: `${bar.dataset.w}%`,
        duration: 1.4,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: bar, start: "top 92%" },
      }
    );
  });

  // ---------- Active nav link ----------
  document.querySelectorAll("main section[id]").forEach((sec) => {
    const link = nav.querySelector(`a[href="#${sec.id}"]`);
    if (!link) return;
    ScrollTrigger.create({
      trigger: sec,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => link.classList.toggle("active", self.isActive),
    });
  });

  // ---------- Custom cursor ----------
  const cursor = document.getElementById("cursor");
  const cx = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
  const cy = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
  window.addEventListener("mousemove", (e) => {
    cx(e.clientX);
    cy(e.clientY);
  });
  document.querySelectorAll("a, button, .power, .stat, .mini-card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });

  // ---------- Web-shooter click effect ----------
  window.addEventListener("click", (e) => {
    const splat = document.createElement("div");
    splat.className = "web-splat";
    splat.innerHTML = buildWeb(8, 3);
    splat.style.left = `${e.clientX}px`;
    splat.style.top = `${e.clientY}px`;
    splat.querySelector("svg").style.stroke = "currentColor";
    document.body.appendChild(splat);

    gsap
      .timeline({ onComplete: () => splat.remove() })
      .fromTo(splat, { scale: 0, rotate: gsap.utils.random(-45, 45) }, { scale: 1, duration: 0.35, ease: "back.out(2)" })
      .to(splat, { opacity: 0, scale: 1.2, duration: 0.6, ease: "power1.in" }, "+=0.25");
  });
}
