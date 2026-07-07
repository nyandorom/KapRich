/* ============================================================
   KapRich — Main JS (matches original theme)
   ============================================================ */

/* ---------- Cart Store ---------- */
const Cart = {
  get items() {
    try { return JSON.parse(localStorage.getItem('ae_cart') || '[]'); } catch { return []; }
  },
  save(items) { localStorage.setItem('ae_cart', JSON.stringify(items)); },
  add(part) {
    const items = this.items;
    const existing = items.find(i => i.id === part.id);
    if (existing) { existing.qty++; }
    else { items.push({ ...part, qty: 1 }); }
    this.save(items);
    this.updateBadge();
    showToast(`Added to cart: ${part.name}`, 'success');
  },
  remove(id) {
    this.save(this.items.filter(i => i.id !== id));
    this.updateBadge();
  },
  updateQty(id, qty) {
    const items = this.items;
    const item = items.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, parseInt(qty) || 1); this.save(items); }
    this.updateBadge();
  },
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  updateBadge() {
    const badge = document.querySelector('.cart-badge');
    const count = this.count();
    if (badge) { badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; }
  }
};

  /* ------------------------------------------------------
     4. Footer year
  ------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------

/* ---------- Toast ---------- */
function showToast(msg, type = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'fadeOut .35s ease forwards';
    setTimeout(() => t.remove(), 350);
  }, 3000);
}

/* ---------- Hamburger ---------- */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.getElementById('main-nav');
  if (!hamburger || !nav) return;
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

/* ---------- Active nav link ---------- */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ---------- Category filters ---------- */
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.part-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
      const noRes = document.getElementById('no-results');
      if (noRes) {
        const any = [...document.querySelectorAll('.part-card')].some(c => c.style.display !== 'none');
        noRes.style.display = any ? 'none' : 'block';
      }
    });
  });
}

/* ---------- Search ---------- */
function initSearch() {
  const input = document.getElementById('parts-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll('.part-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      card.style.display = name.includes(q) ? '' : 'none';
    });
    const noRes = document.getElementById('no-results');
    if (noRes) {
      const any = [...document.querySelectorAll('.part-card')].some(c => c.style.display !== 'none');
      noRes.style.display = any ? 'none' : 'block';
    }
  });
}

/* ---------- Add to Cart buttons ---------- */
function initAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.part-card');
      if (!card) return;
      Cart.add({
        id:    card.dataset.id,
        name:  card.dataset.name,
        price: parseFloat(card.dataset.price),
        img:   card.dataset.img || '',
        cat:   card.dataset.cat || ''
      });
    });
  });
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = form.querySelector('.form-success');
    if (success) success.classList.add('show');
    showToast('Message sent! We\'ll reply within 24 hours.', 'success');
    form.reset();
    setTimeout(() => success?.classList.remove('show'), 6000);
  });
}

/* ---------- Scroll animations ---------- */
function initScrollAnim() {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.service-card, .part-card, .review-card, .feature, .step');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    io.observe(el);
  });
}

/* ---------- Smooth scroll anchors ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  initHamburger();
  setActiveNav();
  initFilters();
  initSearch();
  initAddToCart();
  initContactForm();
  initScrollAnim();
  initSmoothScroll();
});
