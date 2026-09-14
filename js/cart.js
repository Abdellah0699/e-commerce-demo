/* ==========================================================================
   NOIRÉ — Cart
   In-memory cart state for demo purposes (no backend, no persistence).
   ========================================================================== */

const Cart = (() => {
  let items = []; // { id, name, category, price, image, qty }
  const listeners = [];

  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach((fn) => fn(items)); }
  function findItem(id) { return items.find((i) => i.id === id); }

  function addItem(product) {
    const existing = findItem(product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    notify();
  }

  function removeItem(id) {
    items = items.filter((i) => i.id !== id);
    notify();
  }

  function setQty(id, qty) {
    const item = findItem(id);
    if (!item) return;
    if (qty <= 0) { removeItem(id); return; }
    item.qty = qty;
    notify();
  }

  function getItems() { return items; }
  function getCount() { return items.reduce((sum, i) => sum + i.qty, 0); }
  function getSubtotal() { return items.reduce((sum, i) => sum + i.qty * i.price, 0); }
  function formatPrice(n) { return `${n.toFixed(0)} DA`; }

  return { addItem, removeItem, setQty, getItems, getCount, getSubtotal, formatPrice, onChange };
})();

function renderCart() {
  const body = document.getElementById("cartBody");
  const subtotalEl = document.getElementById("cartSubtotal");
  const countEls = [document.getElementById("cartCount"), document.getElementById("cartCountMobile")];
  const items = Cart.getItems();
  const count = Cart.getCount();

  countEls.forEach((el) => {
    if (!el) return;
    el.textContent = count;
    if ("hidden" in el) el.hidden = count === 0;
  });

  subtotalEl.textContent = Cart.formatPrice(Cart.getSubtotal());

  if (items.length === 0) {
    body.innerHTML = `<p class="cart-empty">Your cart is empty. The latest drop is waiting.</p>`;
    return;
  }

  body.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-media">
        <img class="ph-img" data-src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-meta">${item.category}</p>
        </div>
        <div class="cart-item-row">
          <div class="qty-control">
            <button type="button" data-action="decrease" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item-price">${Cart.formatPrice(item.price * item.qty)}</span>
        </div>
        <button type="button" class="cart-item-remove" data-action="remove">Remove</button>
      </div>
    </div>
  `
    )
    .join("");

  applyImagePlaceholders(body);

  body.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.dataset.id;
    row.querySelector('[data-action="increase"]').addEventListener("click", () => {
      const item = Cart.getItems().find((i) => i.id === id);
      Cart.setQty(id, item.qty + 1);
    });
    row.querySelector('[data-action="decrease"]').addEventListener("click", () => {
      const item = Cart.getItems().find((i) => i.id === id);
      Cart.setQty(id, item.qty - 1);
    });
    row.querySelector('[data-action="remove"]').addEventListener("click", () => {
      Cart.removeItem(id);
    });
  });
}

Cart.onChange(renderCart);
