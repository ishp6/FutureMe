/* =========================================================
   Letters to Future Self — app.js
   ========================================================= */

'use strict';

const STORAGE_KEY = 'future_self_letters_v2';

/* ── Utilities ── */

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getLetters() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveLetters(letters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

function isDelivered(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function countdownStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff <= 0) return null;
  const years  = Math.floor(diff / 365);
  const months = Math.floor((diff % 365) / 30);
  const days   = diff - years * 365 - months * 30;
  const parts  = [];
  if (years)  parts.push(`${years} yr${years  > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  if (days || parts.length === 0) parts.push(`${days || diff} day${(days || diff) !== 1 ? 's' : ''}`);
  return parts.join(' · ');
}

function wordCount(str) {
  const words = str.trim().split(/\s+/).filter(Boolean).length;
  return words === 0 ? '0 words' : `${words} word${words !== 1 ? 's' : ''}`;
}

function showToast(msg, duration = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ── Background Effects ── */

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 0.5;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 30}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

/* ── Date Helpers ── */

function setMinDate() {
  const input = document.getElementById('deliveryDate');
  const d = new Date();
  d.setDate(d.getDate() + 1);
  input.min = d.toISOString().split('T')[0];
}

function initTodayDate() {
  const el = document.getElementById('todayDate');
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ── Tab Switching ── */

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  if (tab === 'vault') renderVault();
}

/* ── Write Logic ── */

function initWriteForm() {
  const authorInput = document.getElementById('author');
  const sigName     = document.getElementById('sigName');
  const letterBody  = document.getElementById('letterBody');
  const charCount   = document.getElementById('charCount');
  const dateInput   = document.getElementById('deliveryDate');
  const preview     = document.getElementById('deliveryPreview');

  authorInput.addEventListener('input', () => {
    sigName.textContent = authorInput.value.trim() || '____________________';
  });

  letterBody.addEventListener('input', () => {
    charCount.textContent = wordCount(letterBody.value);
  });

  dateInput.addEventListener('change', () => {
    if (!dateInput.value) { preview.textContent = ''; return; }
    const c = countdownStr(dateInput.value);
    if (c) {
      preview.textContent = `✦ Sealed for ${c} from today`;
    } else {
      preview.textContent = 'Delivered on ' + formatDate(dateInput.value);
    }
  });
}

function sealLetter() {
  const recipient = document.getElementById('recipient').value.trim();
  const author    = document.getElementById('author').value.trim();
  const email     = document.getElementById('email').value.trim();
  const date      = document.getElementById('deliveryDate').value;
  const body      = document.getElementById('letterBody').value.trim();

  if (!recipient) { showToast('Please tell us who this letter is for.'); return; }
  if (!date)      { showToast('When should this letter be delivered?'); return; }
  if (!body)      { showToast('Your letter is still blank — write something.'); return; }

  const letter = {
    id:           Date.now().toString(),
    recipient,
    author:       author || 'Anonymous',
    email,
    deliveryDate: date,
    body,
    createdAt:    new Date().toISOString(),
  };

  const letters = getLetters();
  letters.unshift(letter);
  saveLetters(letters);
  updateLetterCount();

  // Reset
  ['recipient','author','email','deliveryDate','letterBody'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('sigName').textContent       = '____________________';
  document.getElementById('deliveryPreview').textContent = '';
  document.getElementById('charCount').textContent      = '0 words';

  // Animate seal
  animateSeal();

  setTimeout(() => {
    showToast('Your letter has been sealed. 🕯️');
    switchTab('vault');
  }, 800);
}

function animateSeal() {
  const btn = document.getElementById('sealBtn');
  btn.style.transform = 'scale(0.96)';
  btn.innerHTML = '<span class="seal-wax">🔒</span><span class="seal-text">Sealed!</span>';
  setTimeout(() => {
    btn.style.transform = '';
    btn.innerHTML = '<span class="seal-wax">🕯️</span><span class="seal-text">Seal &amp; Save Letter</span><span class="seal-icon">⊛</span>';
  }, 900);
}

/* ── Vault ── */

function updateLetterCount() {
  const letters = getLetters();
  const badge = document.getElementById('letterCount');
  if (letters.length > 0) {
    badge.textContent = letters.length;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function renderVault() {
  const grid  = document.getElementById('lettersGrid');
  const empty = document.getElementById('vaultEmpty');
  const letters = getLetters();

  updateLetterCount();

  if (!letters.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = letters.map((l, i) => {
    const delivered = isDelivered(l.deliveryDate);
    const formattedDelivery = formatDate(l.deliveryDate);
    const formattedCreated  = new Date(l.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const countdown = countdownStr(l.deliveryDate);
    const preview = l.body.substring(0, 120) + (l.body.length > 120 ? '…' : '');

    return `
      <div class="letter-card ${delivered ? 'delivered' : 'sealed'}"
           onclick="openLetter('${l.id}')"
           style="animation-delay: ${i * 0.06}s">
        <button class="card-delete" onclick="deleteLetter(event, '${l.id}')" title="Delete letter">✕</button>
        <div class="card-inner">
          <div class="card-top">
            <div class="card-to">To: ${esc(l.recipient)}</div>
            <div class="card-badge ${delivered ? 'badge-delivered' : 'badge-sealed'}">
              <span class="badge-dot"></span>
              ${delivered ? 'Delivered' : 'Sealed'}
            </div>
          </div>
          <div class="card-meta">
            Written by ${esc(l.author)} &nbsp;·&nbsp; ${formattedCreated}
            &nbsp;·&nbsp; Deliver ${formattedDelivery}
          </div>
          ${delivered ? `<div class="card-preview">${esc(preview)}</div>` : ''}
          ${!delivered && countdown ? `
            <div class="card-countdown">
              <span class="countdown-label">Opens in</span>
              <span class="countdown-value">${countdown}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function deleteLetter(event, id) {
  event.stopPropagation();
  if (!confirm('Delete this letter? This cannot be undone.')) return;
  const letters = getLetters().filter(l => l.id !== id);
  saveLetters(letters);
  renderVault();
  showToast('Letter deleted.');
}

/* ── Modal ── */

function openLetter(id) {
  const l = getLetters().find(x => x.id === id);
  if (!l) return;

  const overlay    = document.getElementById('modalOverlay');
  const stamp      = document.getElementById('modalStamp');
  const meta       = document.getElementById('modalMeta');
  const body       = document.getElementById('modalBody');
  const sig        = document.getElementById('modalSig');
  const scroll     = document.getElementById('modalScroll');

  const delivered        = isDelivered(l.deliveryDate);
  const formattedDelivery = formatDate(l.deliveryDate);
  const formattedCreated  = new Date(l.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (delivered) {
    scroll.innerHTML = `
      <div class="modal-stamp">Delivered · ${formattedDelivery}</div>
      <div class="modal-meta">Written on ${formattedCreated} &nbsp;·&nbsp; From the past</div>
      <div class="modal-body">${esc(l.body)}</div>
      <div class="modal-sig">&mdash; ${esc(l.author)}</div>
    `;
  } else {
    const countdown = countdownStr(l.deliveryDate);
    scroll.innerHTML = `
      <div class="modal-sealed">
        <div class="sealed-lock">🔒</div>
        <div class="sealed-title">This letter is sealed</div>
        <div class="sealed-date">To be opened on ${formattedDelivery}</div>
        ${countdown ? `<div class="sealed-countdown">Opens in ${countdown}</div>` : ''}
      </div>
    `;
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

/* ── Keyboard ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initTodayDate();
  setMinDate();
  initWriteForm();
  updateLetterCount();

  // Header entrance animation delay
  setTimeout(() => {
    document.getElementById('siteHeader').style.opacity = '1';
  }, 100);
});
