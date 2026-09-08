/* ==========================================================================
   NOIRÉ — Main
   Wires up navigation, product rendering, cart drawer, category
   interactions, image placeholders, and page init.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   Image placeholders
   Every image loads lazily from a data-src attribute. If the asset is
   missing (until real photography is dropped into assets/images/), we swap
   in an elegant dark placeholder instead of a broken image icon.
--------------------------------------------------------------------------- */

function applyImagePlaceholders(scope = document) {
  scope.querySelectorAll("img[data-src]").forEach((img) => {
    if (img.dataset.phBound) return;
    img.dataset.phBound = "true";

    const src = img.getAttribute("data-src");
    if (!src) return;
    const label = src.split("/").pop();

    img.addEventListener("error", () => {
      const wrapper = img.parentElement;
      img.remove();
      const fallback = document.createElement("div");
      fallback.className = "ph-fallback";
      fallback.innerHTML = `<span>${label}</span>`;
      wrapper.appendChild(fallback);
    });

    img.src = src;
  });
}

/* ---------------------------------------------------------------------------
   Product rendering
   The HTML defines the asymmetric layout (which slot is large/small/wide);
   this just fills each slot with data from products.js.
--------------------------------------------------------------------------- */

function fillProductSlot(article, product) {
  article.querySelector(".product-media img").setAttribute("data-src", product.image);
  article.querySelector(".product-media img").setAttribute("alt", product.name);
  article.querySelector(".product-number").textContent = product.number;
  article.querySelector(".product-name").textContent = product.name;
  article.querySelector(".product-category").textContent = product.category;
  article.querySelector(".product-price").textContent = Cart.formatPrice(product.price);

  const addBtn = article.querySelector('[data-action="quick-add"]');
  addBtn.addEventListener("click", () => {
    Cart.addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image
    });
    showToast(`${product.name} added to cart`);
    openCart();
  });
}

function renderProductSlots(list) {
  list.forEach((product) => {
    const article = document.querySelector(`[data-product-id="${product.id}"]`);
    if (article) fillProductSlot(article, product);
  });
}

/* ---------------------------------------------------------------------------
   Cart drawer
--------------------------------------------------------------------------- */

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

function openCart() {
  cartDrawer.classList.add("is-open");
  cartOverlay.classList.add("is-visible");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartOverlay.classList.remove("is-visible");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartToggleMobile").addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
continueShoppingBtn.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  if (Cart.getItems().length === 0) {
    showToast("Your cart is empty");
    return;
  }
  showToast("Checkout is part of the full client build — demo only");
});

/* ---------------------------------------------------------------------------
   Toast
--------------------------------------------------------------------------- */

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* ---------------------------------------------------------------------------
   Desktop search panel
--------------------------------------------------------------------------- */

const searchToggle = document.getElementById("searchToggle");
const searchToggleMobile = document.getElementById("searchToggleMobile");
const searchPanel = document.getElementById("searchPanel");
const searchClose = document.getElementById("searchClose");
const searchInput = document.getElementById("searchInput");

function openSearch() {
  searchPanel.classList.add("is-open");
  searchToggle?.setAttribute("aria-expanded", "true");
  setTimeout(() => searchInput.focus(), 200);
}
function closeSearch() {
  searchPanel.classList.remove("is-open");
  searchToggle?.setAttribute("aria-expanded", "false");
}

searchToggle?.addEventListener("click", () => {
  const isOpen = searchPanel.classList.contains("is-open");
  isOpen ? closeSearch() : openSearch();
});
searchToggleMobile?.addEventListener("click", () => {
  closeMobileNav();
  openSearch();
});
searchClose?.addEventListener("click", closeSearch);

/* ---------------------------------------------------------------------------
   Mobile fullscreen menu
--------------------------------------------------------------------------- */

const mobileNav = document.getElementById("mobileNav");
const menuToggle = document.getElementById("menuToggle");
const menuToggleMobile = document.getElementById("menuToggleMobile");
const mobileNavClose = document.getElementById("mobileNavClose");

function openMobileNav() {
  mobileNav.classList.add("is-open");
  menuToggleMobile?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeMobileNav() {
  mobileNav.classList.remove("is-open");
  menuToggleMobile?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuToggle?.addEventListener("click", openMobileNav);
menuToggleMobile?.addEventListener("click", openMobileNav);
mobileNavClose.addEventListener("click", closeMobileNav);
mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileNav));

/* ---------------------------------------------------------------------------
   Category list — hover preview (desktop) / tap-to-expand (touch)
--------------------------------------------------------------------------- */

function initCategoryRows() {
  const rows = document.querySelectorAll(".category-row");
  rows.forEach((row) => {
    const button = row.querySelector("button");
    button.addEventListener("click", () => {
      const isActive = row.classList.contains("is-active");
      rows.forEach((r) => {
        r.classList.remove("is-active");
        r.querySelector("button").setAttribute("aria-expanded", "false");
      });
      if (!isActive) {
        row.classList.add("is-active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
}


/* ---------------------------------------------------------------------------
   Init
--------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderProductSlots(PRODUCTS.featured);
  renderProductSlots(PRODUCTS.essentials);
  renderCart();
  applyImagePlaceholders(document);
  initCategoryRows();
  initHeaderScroll();
  initParallax();
  initCustomCursor();

  observeReveal(document.querySelectorAll(".reveal"));

  document.dispatchEvent(new CustomEvent("noire:content-updated"));
});
