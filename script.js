(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky nav: shrink into floating pill on scroll */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 16);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const closeMenu = () => {
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* Smooth anchor scroll, clearing the floating nav */
  const anchorOffset = () => (window.innerWidth <= 900 ? 76 : 96);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - anchorOffset();
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Active-section scroll-spy + sliding nav indicator */
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...navLinks.querySelectorAll('a[href^="#"]')];
  const indicator = navLinks.querySelector(".nav-indicator");
  const moveIndicator = (link) => {
    if (!indicator || !link || window.innerWidth <= 900) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  const spy = () => {
    const pos = window.scrollY + 130;
    let current = sections[0]?.id;
    for (const s of sections) if (s.offsetTop <= pos) current = s.id;
    let active = null;
    links.forEach((l) => {
      const isActive = l.getAttribute("href") === `#${current}`;
      l.classList.toggle("active", isActive);
      if (isActive) active = l;
    });
    moveIndicator(active);
  };
  spy();
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);

  /* Scroll reveal with per-group stagger */
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = [...parent.querySelectorAll(":scope > .reveal")];
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty("--i", idx);
  });
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* Animated counters (CGPA, achievement ranks) */
  const counters = document.querySelectorAll("[data-count]");
  const counterStatic = (el) => {
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = parseFloat(el.dataset.count).toFixed(decimals) + (el.dataset.suffix || "");
  };
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    counters.forEach(counterStatic);
  } else {
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        }
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* Live IST clock in the hero panel */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => { clock.textContent = `${fmt.format(new Date())} IST`; };
    update();
    setInterval(update, 1000);
  }

  /* Subtle cursor glow — fine pointers only, no reduced motion */
  const glow = document.querySelector("[data-cursor-glow]");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    document.body.classList.add("cursor-on");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    const raf = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(raf);
    };
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    requestAnimationFrame(raf);
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
