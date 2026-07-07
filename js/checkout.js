/* ============================================================
   AutoElite — Checkout Page JS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  initCardFormatting();

  const stripeKey = document.querySelector('meta[name="stripe-key"]')?.content || '';
  const isRealKey = stripeKey && stripeKey !== 'YOUR_STRIPE_PUBLISHABLE_KEY';

  // Show fallback fields when no real Stripe key
  const fallback = document.getElementById('fallback-fields');
  const cardEl   = document.getElementById('card-element');
  if (!isRealKey) {
    if (fallback) fallback.style.display = 'block';
    if (cardEl)   cardEl.style.display   = 'none';
  }

  if (isRealKey) {
    const stripe   = Stripe(stripeKey);
    const elements = stripe.elements();
    const card     = elements.create('card', {
      style: {
        base: { fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#111827', '::placeholder': { color: '#9CA3AF' } }
      }
    });
    if (cardEl) {
      card.mount('#card-element');
      card.on('change', ({ error }) => {
        const err = document.getElementById('card-errors');
        if (err) err.textContent = error ? error.message : '';
      });
    }
    document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      setLoading(true);
      const { error } = await stripe.createPaymentMethod({ type: 'card', card });
      if (error) {
        document.getElementById('card-errors').textContent = error.message;
        setLoading(false);
      } else {
        Cart.save([]); Cart.updateBadge();
        window.location.href = 'success.html';
      }
    });
  } else {
    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
      setLoading(true);
      setTimeout(() => {
        Cart.save([]); Cart.updateBadge();
        window.location.href = 'success.html';
      }, 1600);
    });
  }
});

function renderCheckoutSummary() {
  const items = Cart.items;
  const wrap  = document.getElementById('checkout-items');
  if (!wrap) return;

  if (!items.length) {
    wrap.innerHTML = '<p style="color:#9CA3AF;font-size:.88rem;text-align:center;padding:20px;">Your cart is empty.</p>';
    return;
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.08;
  const total    = subtotal + tax;

  wrap.innerHTML = items.map(i => `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;font-size:.88rem;">
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${i.img || 'https://images.unsplash.com/photo-1619677137796-8f15861e1531?w=80&q=60'}" 
             alt="${i.name}" style="width:42px;height:42px;object-fit:cover;border-radius:6px;">
        <div>
          <strong style="display:block;color:#111827;">${i.name}</strong>
          <span style="color:#9CA3AF;">×${i.qty}</span>
        </div>
      </div>
      <strong>$${(i.price * i.qty).toFixed(2)}</strong>
    </div>
  `).join('');

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('co-subtotal', `$${subtotal.toFixed(2)}`);
  set('co-tax',      `$${tax.toFixed(2)}`);
  set('co-total',    `$${total.toFixed(2)}`);
}

function setLoading(on) {
  const btn = document.getElementById('pay-btn');
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Processing...' : 'Complete Purchase';
}

function initCardFormatting() {
  const cn = document.getElementById('card-number');
  if (cn) cn.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
  const ex = document.getElementById('card-expiry');
  if (ex) ex.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
    e.target.value = v;
  });
}

/* spin keyframe */
const s = document.createElement('style');
s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(s);
