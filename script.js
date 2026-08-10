(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Typing effect */
  const roles = ["Backend Developer", "Spring Boot Developer", "Full-Stack Developer"];
  const typeEl = document.getElementById("typeWriter");
  if (typeEl && !reduceMotion) {
    let role = 0, char = 0, deleting = false;
    const tick = () => {
      const word = roles[role];
      typeEl.textContent = word.slice(0, char);
      if (!deleting && char < word.length) {
        char++;
        setTimeout(tick, 80);
      } else if (!deleting) {
        deleting = true;
        setTimeout(tick, 1600);
      } else if (char > 0) {
        char--;
        setTimeout(tick, 45);
      } else {
        deleting = false;
        role = (role + 1) % roles.length;
        setTimeout(tick, 350);
      }
    };
    tick();
  } else if (typeEl) {
    typeEl.textContent = roles[0];
  }

  /* Sticky nav state */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu toggle */
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

  /* Precise anchor scroll: land each section start just below the floating pill nav */
  navLinks.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Active nav link highlighting + sliding indicator */
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...navLinks.querySelectorAll("a")];
  const indicator = navLinks.querySelector(".nav-indicator");
  const moveIndicator = (link) => {
    if (!indicator || !link || window.innerWidth <= 860) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  const spy = () => {
    const pos = window.scrollY + 120;
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

  /* Dark-section nav state: flip nav to light when the dark Projects section
     overlaps the nav's vertical band near the top of the viewport. */
  const projects = document.getElementById("projects");
  const NAV_BAND = 96;
  const updateNavOnDark = () => {
    if (!projects) return;
    const top = projects.offsetTop;
    const bottom = top + projects.offsetHeight;
    const bandTop = window.scrollY;
    const bandBottom = window.scrollY + NAV_BAND;
    nav.classList.toggle("nav--on-dark", top < bandBottom && bottom > bandTop);
  };
  updateNavOnDark();
  window.addEventListener("scroll", updateNavOnDark, { passive: true });
  window.addEventListener("resize", updateNavOnDark);

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
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
