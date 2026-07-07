/* ============================================================
   AutoElite — Cart Page JS
   ============================================================ */
document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const items = Cart.items;
  const emptyEl  = document.getElementById('empty-cart');
  const filledEl = document.getElementById('cart-filled');
  const wrapEl   = document.getElementById('cart-items');
  if (!wrapEl) return;

  if (!items.length) {
    if (emptyEl)  emptyEl.style.display  = 'block';
    if (filledEl) filledEl.style.display = 'none';
    return;
  }
  if (emptyEl)  emptyEl.style.display  = 'none';
  if (filledEl) filledEl.style.display = 'block';

  wrapEl.innerHTML = items.map(item => `
    <div class="cart-row" data-id="${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-thumb">
          <img src="${item.img || 'https://images.unsplash.com/photo-1619677137796-8f15861e1531?w=120&q=60'}"
               alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
        </div>
        <div>
          <strong>${item.name}</strong>
          <span>${item.cat || 'Auto Part'}</span>
        </div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <input class="qty-input" type="number" value="${item.qty}" min="1" onchange="setQty('${item.id}', this.value)">
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <div class="item-unit" style="font-size:.9rem;color:#4B5563;">$${item.price.toFixed(2)}</div>
      <div class="item-total">$${(item.price * item.qty).toFixed(2)}</div>
      <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remove">✕</button>
    </div>
  `).join('');

  updateSummary();
}

function updateSummary() {
  const items    = Cart.items;
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.08;
  const total    = subtotal + tax;
  const shipping = subtotal >= 75 ? 'Free' : '$9.99';

  set('co-subtotal', `$${subtotal.toFixed(2)}`);
  set('co-tax',      `$${tax.toFixed(2)}`);
  set('co-shipping', shipping);
  set('co-total',    `$${total.toFixed(2)}`);
  set('item-count',  `${Cart.count()} item${Cart.count() !== 1 ? 's' : ''}`);
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function changeQty(id, delta) {
  const item = Cart.items.find(i => i.id === id);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty < 1) { removeItem(id); return; }
  Cart.updateQty(id, newQty);
  renderCart();
}

function setQty(id, val) {
  if (parseInt(val) < 1) { removeItem(id); return; }
  Cart.updateQty(id, val);
  renderCart();
}

function removeItem(id) {
  Cart.remove(id);
  renderCart();
  showToast('Item removed from cart');
}

function clearCart() {
  if (!confirm('Clear your entire cart?')) return;
  Cart.save([]);
  Cart.updateBadge();
  renderCart();
  showToast('Cart cleared');
}
