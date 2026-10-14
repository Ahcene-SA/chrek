/* ═══════════════════════════════════════════════════════════
   LOCATION FODIL — Interactions
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Navbar : ombre au scroll ─────────────────────────── */
  const navbar = document.getElementById("navbar");
  const onScrollNav = () => navbar.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ── Menu mobile ──────────────────────────────────────── */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ── Lien actif selon la section visible ──────────────── */
  const sections = ["accueil", "services", "flotte", "agence", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = [...nav.querySelectorAll(".nav__link")];

  const onScrollSpy = () => {
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    for (const s of sections) if (s.offsetTop <= y) current = s.id;
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === `#${current}`)
    );
  };
  window.addEventListener("scroll", onScrollSpy, { passive: true });
  onScrollSpy();

  /* ── Hero slider ──────────────────────────────────────── */
  const slides = [...document.querySelectorAll(".hero__slide")];
  const heroDotsBox = document.getElementById("heroDots");
  let heroIndex = 0;
  let heroTimer;

  slides.forEach((slide, i) => {
    // délai en cascade du contenu du slide actif au chargement
    slide.querySelectorAll(".reveal").forEach((el, j) => el.style.setProperty("--i", j));

    const dot = document.createElement("button");
    dot.className = "hero__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    heroDotsBox.appendChild(dot);
  });
  const heroDots = [...heroDotsBox.children];

  function goToSlide(i) {
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach((s, j) => {
      s.classList.toggle("is-active", j === heroIndex);
      // rejoue l'animation d'entrée du contenu
      s.querySelectorAll(".reveal").forEach((el) => {
        el.classList.remove("is-visible");
        if (j === heroIndex) requestAnimationFrame(() =>
          requestAnimationFrame(() => el.classList.add("is-visible"))
        );
      });
    });
    heroDots.forEach((d, j) => d.classList.toggle("is-active", j === heroIndex));
    restartHeroTimer();
  }

  function restartHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToSlide(heroIndex + 1), 6500);
  }

  document.getElementById("heroPrev").addEventListener("click", () => goToSlide(heroIndex - 1));
  document.getElementById("heroNext").addEventListener("click", () => goToSlide(heroIndex + 1));
  restartHeroTimer();

  /* ── Carrousel flotte ─────────────────────────────────── */
  const viewport = document.getElementById("fleetViewport");
  const track = document.getElementById("fleetTrack");
  const cards = [...track.children];
  const prevBtn = document.getElementById("fleetPrev");
  const nextBtn = document.getElementById("fleetNext");
  const fleetDotsBox = document.getElementById("fleetDots");

  let page = 0;
  let perView = 3;

  const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const cardW = () => cards[0].getBoundingClientRect().width + gap();
  const pageCount = () => Math.max(1, Math.ceil(cards.length / perView));

  function buildFleetDots() {
    fleetDotsBox.innerHTML = "";
    for (let i = 0; i < pageCount(); i++) {
      const dot = document.createElement("button");
      dot.className = "fleet__dot" + (i === page ? " is-active" : "");
      dot.setAttribute("aria-label", `Page ${i + 1}`);
      dot.addEventListener("click", () => goToPage(i));
      fleetDotsBox.appendChild(dot);
    }
  }

  function goToPage(i) {
    page = Math.min(Math.max(i, 0), pageCount() - 1);
    // dernière page : caler sur le bout de la piste pour ne pas laisser de vide
    const maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const offset = Math.min(page * perView * cardW(), maxOffset);
    track.style.transform = `translateX(${-offset}px)`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === pageCount() - 1;
    [...fleetDotsBox.children].forEach((d, j) => d.classList.toggle("is-active", j === page));
  }

  function layoutFleet() {
    const w = viewport.clientWidth;
    const cw = cards[0].getBoundingClientRect().width + gap();
    perView = Math.max(1, Math.floor((w + gap()) / cw));
    // recentrer : afficher des groupes complets quand possible
    perView = Math.min(perView, 3);
    buildFleetDots();
    goToPage(page);
  }

  prevBtn.addEventListener("click", () => goToPage(page - 1));
  nextBtn.addEventListener("click", () => goToPage(page + 1));
  window.addEventListener("resize", layoutFleet);
  layoutFleet();

  // balayage tactile
  let startX = null;
  viewport.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 48) goToPage(page + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  /* ── Révélation au scroll ─────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ── Formulaire → WhatsApp ────────────────────────────── */
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const text =
      `Bonjour, je suis ${f.name.value}.\n` +
      `Je souhaite réserver : ${f.car.value}.\n` +
      (f.message.value ? `Détails : ${f.message.value}\n` : "") +
      `Téléphone : ${f.phone.value}`;
    window.open(`https://wa.me/213553599541?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
});
