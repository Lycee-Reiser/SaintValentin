// ============================================
// Saint-Valentin — script principal
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initQuantityControls();
  initCart();
  initForm();
});

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileNav.classList.contains('hidden');
    mobileNav.classList.toggle('hidden', isOpen);
    mobileNav.classList.toggle('flex', !isOpen);
    menuBtn.querySelector('i').className = isOpen ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      mobileNav.classList.remove('flex');
      menuBtn.querySelector('i').className = 'fa-solid fa-bars';
    });
  });
}

/* ---------- Sélecteurs de quantité (par carte produit) ---------- */
function initQuantityControls() {
  document.querySelectorAll('.qty-control').forEach((control) => {
    const valueEl = control.querySelector('.qty-value');
    let qty = 0;

    control.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        qty = action === 'plus' ? qty + 1 : Math.max(0, qty - 1);
        valueEl.textContent = qty;
        control.dataset.qty = qty;
      });
    });
  });
}

/* ---------- Panier ---------- */
const cart = [];

function initCart() {
  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const control = card.querySelector('.qty-control');
      const qty = parseInt(control.dataset.qty || '0', 10);

      if (qty <= 0) {
        control.classList.add('ring-2', 'ring-red-400');
        setTimeout(() => control.classList.remove('ring-2', 'ring-red-400'), 900);
        return;
      }

      const name = btn.dataset.product;
      const unitPrice = parseFloat(btn.dataset.unitPrice);

      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ name, qty, unitPrice });
      }

      // reset quantity selector on the card
      control.dataset.qty = 0;
      control.querySelector('.qty-value').textContent = '0';

      // brief confirmation state on the button
      const originalText = btn.textContent;
      btn.textContent = 'Ajouté ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('added');
      }, 1200);

      renderCart();
    });
  });
}

function renderCart() {
  const summary = document.getElementById('cart-summary');
  const list = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');

  if (cart.length === 0) {
    summary.classList.add('hidden');
    countEl.textContent = '0';
    return;
  }

  summary.classList.remove('hidden');
  list.innerHTML = '';

  let total = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    const lineTotal = item.qty * item.unitPrice;
    total += lineTotal;
    totalItems += item.qty;

    const li = document.createElement('li');
    li.className = 'flex items-center justify-between py-2';
    li.innerHTML = `
      <span>${item.qty} × ${item.name}</span>
      <span class="font-medium">${lineTotal.toFixed(2).replace('.', ',')} €</span>
    `;
    list.appendChild(li);
  });

  totalEl.textContent = `${total.toFixed(2).replace('.', ',')} €`;
  countEl.textContent = String(totalItems);
}

/* ---------- Formulaire de commande ---------- */
function initForm() {
  const form = document.getElementById('order-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  const rules = {
    fullname: {
      test: (v) => v.trim().length >= 3,
      message: 'Merci d’indiquer votre nom et prénom.',
    },
    classe: {
      test: (v) => v.trim().length >= 2,
      message: 'Merci d’indiquer votre classe.',
    },
    email: {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Merci d’indiquer une adresse e-mail valide.',
    },
    produit: {
      test: (v) => v.trim().length > 0,
      message: 'Merci de choisir un produit.',
    },
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const field = form.elements[fieldName];
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      const rule = rules[fieldName];

      if (!rule.test(field.value)) {
        isValid = false;
        field.classList.add('invalid');
        if (errorEl) errorEl.textContent = rule.message;
      } else {
        field.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (!isValid) {
      successMsg.classList.add('hidden');
      return;
    }

    // Pas de backend : on simule l'envoi et on confirme à l'élève.
    successMsg.classList.remove('hidden');
    form.reset();
    Object.keys(rules).forEach((fieldName) => {
      form.elements[fieldName].classList.remove('invalid');
    });

    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
