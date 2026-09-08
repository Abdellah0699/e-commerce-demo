/* ==========================================================================
   NOIRÉ — Animations
   Header transform on scroll, hero/editorial parallax, scroll reveal,
   and the desktop custom cursor. Marquees are pure CSS (see style.css).
   ========================================================================== */

/* ---------------------------------------------------------------------------
   Header: transparent overlay -> compact dark bar
--------------------------------------------------------------------------- */

function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  let ticking = false;

  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}

/* ---------------------------------------------------------------------------
   Parallax: hero image + editorial statement, driven by scroll position
--------------------------------------------------------------------------- */

function initParallax() {
  const editorialImg = document.getElementById("editorialImg");
  const editorialHeading = document.getElementById("editorialHeading");
  const editorialSection = document.querySelector(".editorial-statement");

  if (!editorialImg) return;

  let ticking = false;

  function update() {
    const rect = editorialSection.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (rect.bottom > 0 && rect.top < viewportH) {
      const progress = (viewportH - rect.top) / (viewportH + rect.height);
      const shift = (progress - 0.5) * 60;
      editorialImg.style.transform = `translateY(${shift}px)`;
      editorialHeading.style.transform = `translateY(${shift * -0.4}px)`;
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
}

/* ---------------------------------------------------------------------------
   Scroll reveal
--------------------------------------------------------------------------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

function observeReveal(elements) {
  elements.forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------------------------
   Custom cursor (desktop only)
--------------------------------------------------------------------------- */

function initCustomCursor() {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  const cursor = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  if (!cursor) return;

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let active = false;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function loop() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    cursor.style.setProperty("--cx", `${currentX}px`);
    cursor.style.setProperty("--cy", `${currentY}px`);
    requestAnimationFrame(loop);
  }
  loop();

  function bindTargets() {
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "true";
      el.addEventListener("mouseenter", () => {
        active = true;
        cursor.classList.add("is-active");
        label.textContent = el.dataset.cursor;
      });
      el.addEventListener("mouseleave", () => {
        active = false;
        cursor.classList.remove("is-active");
      });
    });
  }

  bindTargets();
  // Re-bind after dynamic content (product grids) is injected
  document.addEventListener("noire:content-updated", bindTargets);
}
