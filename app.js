/* ============================================================
   EntreSkill Hub — Shared Application Logic
   app.js — include in every page
   ============================================================ */

/* ── SIDEBAR NAV ── */
function initSidebar() {
  const items = document.querySelectorAll('.es-nav-item');
  const current = window.location.pathname.split('/').pop();
  items.forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href === current || href.replace('.html','') === current.replace('.html','')) {
      item.classList.add('active');
    }
    item.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') e.preventDefault();
    });
  });
}

/* ── TABS ── */
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '[data-tabs]');
  containers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panes   = container.querySelectorAll('.tab-pane');
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        if (panes[i]) panes[i].classList.add('active');
      });
    });
  });
}

/* ── MODALS ── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', function handleOutside(e) {
    if (e.target === overlay) {
      closeModal(id);
      overlay.removeEventListener('click', handleOutside);
    }
  });
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal(id);
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'success', duration = 3200) {
  const existing = document.getElementById('es-toast');
  if (existing) existing.remove();

  const colours = {
    success: { bg: 'var(--accent)',  text: 'white' },
    error:   { bg: 'var(--warm)',    text: 'white' },
    info:    { bg: 'var(--ink)',     text: 'white' },
    warning: { bg: '#f4b942',        text: 'var(--ink)' },
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const c = colours[type] || colours.info;

  const toast = document.createElement('div');
  toast.id = 'es-toast';
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:${c.bg}; color:${c.text};
    padding:14px 20px; border-radius:50px;
    font-family:var(--font-body); font-size:14px; font-weight:500;
    display:flex; align-items:center; gap:10px;
    box-shadow:0 8px 28px rgba(13,13,13,0.18);
    transform:translateY(20px); opacity:0;
    transition:all 0.25s ease;
    max-width:340px;
    cursor:pointer;
  `;
  toast.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  const dismiss = () => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 260);
  };
  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

/* ── CONFIRM DIALOG ── */
function esConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:9000;background:rgba(13,13,13,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;`;
  overlay.innerHTML = `
    <div style="background:var(--cream);border-radius:20px;padding:36px;max-width:400px;width:100%;box-shadow:var(--shadow-lg);text-align:center;">
      <div style="font-size:36px;margin-bottom:16px;">⚠️</div>
      <div style="font-family:var(--font-display);font-size:18px;font-weight:800;letter-spacing:-0.5px;margin-bottom:10px;">Are you sure?</div>
      <p style="font-size:14px;color:var(--muted);margin-bottom:28px;line-height:1.6;">${message}</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button id="es-confirm-yes" style="background:var(--ink);color:white;border:none;border-radius:50px;padding:11px 28px;font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer;">Confirm</button>
        <button id="es-confirm-no"  style="background:transparent;border:1.5px solid var(--border);border-radius:50px;padding:10px 28px;font-family:var(--font-body);font-size:14px;cursor:pointer;">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const cleanup = () => { overlay.remove(); document.body.style.overflow = ''; };
  document.getElementById('es-confirm-yes').onclick = () => { cleanup(); if (onConfirm) onConfirm(); };
  document.getElementById('es-confirm-no').onclick  = () => { cleanup(); if (onCancel)  onCancel();  };
  overlay.addEventListener('click', e => { if (e.target === overlay) { cleanup(); if (onCancel) onCancel(); } });
}

/* ── FILTER / SEARCH HELPER ── */
function filterItems(query, selector, matchFn) {
  const items = document.querySelectorAll(selector);
  let shown = 0;
  items.forEach(item => {
    const match = matchFn ? matchFn(item, query) : item.textContent.toLowerCase().includes(query.toLowerCase());
    item.style.display = match ? '' : 'none';
    if (match) shown++;
  });
  return shown;
}

/* ── LOCAL STORAGE HELPERS ── */
const store = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem('es_' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem('es_' + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove: (key) => { try { localStorage.removeItem('es_' + key); } catch {} },
  clear: () => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('es_')).forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};

/* ── MOCK USER SESSION ── */
const currentUser = {
  name: 'Priya Ramesh',
  initials: 'PR',
  role: 'entrepreneur',
  city: 'Chennai',
  avatarColor: '#2d6a4f',
  roadmapProgress: 64,
  streak: 5,
  sessionsBooked: 4,
  resourcesDone: 18,
};

/* ── PROGRESS BARS — animate on load ── */
function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-fill[data-width]');
  bars.forEach(bar => {
    const w = bar.getAttribute('data-width');
    setTimeout(() => { bar.style.width = w + '%'; }, 120);
  });
}

/* ── READING TIME ESTIMATOR ── */
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return mins + ' min read';
}

/* ── DATE HELPERS ── */
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60)   + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

function formatDate(date, style = 'short') {
  const d = new Date(date);
  if (style === 'short')  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (style === 'long')   return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  if (style === 'time')   return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN');
}

/* ── CURRENCY FORMAT ── */
function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/* ── DEBOUNCE ── */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ── FORM VALIDATION ── */
function validateForm(formEl) {
  const inputs = formEl.querySelectorAll('[data-required]');
  let valid = true;
  inputs.forEach(input => {
    const err = input.parentElement.querySelector('.form-error');
    if (!input.value.trim()) {
      valid = false;
      input.style.borderColor = 'var(--warm)';
      if (err) err.textContent = input.getAttribute('data-required') || 'This field is required';
    } else {
      input.style.borderColor = '';
      if (err) err.textContent = '';
    }
  });
  return valid;
}

/* ── MOBILE SIDEBAR TOGGLE ── */
function initMobileNav() {
  const toggleBtn = document.getElementById('es-nav-toggle');
  const sidebar   = document.querySelector('.es-sidebar');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    document.body.classList.toggle('sidebar-overlay');
  });

  document.addEventListener('click', e => {
    if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
      sidebar.classList.remove('mobile-open');
      document.body.classList.remove('sidebar-overlay');
    }
  });
}

/* ── NOTIFICATION BADGE UPDATE ── */
function updateNotifBadge(count) {
  const badge = document.querySelector('.es-notif-badge');
  if (!badge) return;
  if (count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
  else           { badge.style.display = 'none'; }
}

/* ── SMOOTH SCROLL TO SECTION ── */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── COPY TO CLIPBOARD ── */
function copyToClipboard(text, successMsg = 'Copied!') {
  navigator.clipboard.writeText(text)
    .then(() => showToast(successMsg, 'success'))
    .catch(() => showToast('Could not copy. Try manually.', 'error'));
}

/* ── CHART: MINI BAR ── */
function renderMiniBar(containerId, data, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data.map(d => d.value), 1);
  const color = options.color || 'var(--accent-light)';
  el.style.cssText = 'display:flex;align-items:flex-end;gap:6px;height:' + (options.height || 80) + 'px;';
  el.innerHTML = data.map(d => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      ${options.showValues ? `<span style="font-size:10px;font-weight:600;color:var(--ink);">${d.value}</span>` : ''}
      <div style="width:100%;height:${Math.round(d.value/max*(options.height||80)*0.85)}px;background:${color};border-radius:4px 4px 0 0;transition:opacity .2s;" title="${d.label}: ${d.value}"></div>
      <span style="font-size:10px;color:var(--muted);">${d.label}</span>
    </div>`).join('');
}

/* ── CHART: DONUT ── */
function renderDonut(svgId, segments, size = 100) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const r = 40, cx = size/2, cy = size/2;
  const total = segments.reduce((s,d) => s+d.value, 0);
  let offset = 0;
  const circumference = 2 * Math.PI * r;
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="12"/>`;
  segments.forEach(seg => {
    const frac = seg.value / total;
    const dash = frac * circumference;
    const gap  = circumference - dash;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', seg.color);
    circle.setAttribute('stroke-width', '12');
    circle.setAttribute('stroke-dasharray', `${dash} ${gap}`);
    circle.setAttribute('stroke-dashoffset', -offset * circumference);
    circle.setAttribute('stroke-linecap', 'round');
    circle.style.transform = 'rotate(-90deg)';
    circle.style.transformOrigin = 'center';
    svg.appendChild(circle);
    offset += frac;
  });
}

/* ── HEATMAP GENERATOR ── */
function renderHeatmap(containerId, weeks = 26) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.style.cssText = 'display:grid;grid-template-columns:repeat(' + weeks + ',1fr);gap:3px;';
  const levels = [0,0,0,1,1,2,2,2,3,3,4];
  for (let i = 0; i < weeks * 7; i++) {
    const cell = document.createElement('div');
    const lvl  = Math.random() > 0.3 ? levels[Math.floor(Math.random()*levels.length)] : 0;
    cell.style.cssText = `aspect-ratio:1;border-radius:2px;cursor:pointer;background:${['var(--paper)','#b7e4c7','#74c69d','#40916c','#1b4332'][lvl]};transition:transform .1s;`;
    cell.title = `Activity level: ${['None','Low','Medium','High','Very high'][lvl]}`;
    cell.addEventListener('mouseenter', () => cell.style.transform = 'scale(1.3)');
    cell.addEventListener('mouseleave', () => cell.style.transform = '');
    el.appendChild(cell);
  }
}

/* ── SEARCH MODAL ── */
function initSearchModal() {
  const pages = [
    { title: 'Dashboard',            url: 'dashboard.html',        icon: '🏠', cat: 'Pages' },
    { title: 'Business Ideas',       url: 'business-ideas.html',   icon: '💡', cat: 'Pages' },
    { title: 'My Roadmap',           url: 'roadmap.html',          icon: '🗺️', cat: 'Pages' },
    { title: 'Learning Library',     url: 'learning.html',         icon: '📚', cat: 'Pages' },
    { title: 'Mentor Directory',     url: 'mentor-directory.html', icon: '👥', cat: 'Pages' },
    { title: 'Q&A Community',        url: 'qa-forum.html',         icon: '💬', cat: 'Pages' },
    { title: 'Business Plan',        url: 'business-plan.html',    icon: '📝', cat: 'Tools' },
    { title: 'Cost Calculator',      url: 'cost-calculator.html',  icon: '🧮', cat: 'Tools' },
    { title: 'Legal Guide',          url: 'legal-guide.html',      icon: '⚖️', cat: 'Tools' },
    { title: 'Govt. Scheme Finder',  url: 'scheme-finder.html',    icon: '🏛️', cat: 'Tools' },
    { title: 'Progress Report',      url: 'progress-report.html',  icon: '📊', cat: 'Tools' },
    { title: 'Profile & Settings',   url: 'profile.html',          icon: '👤', cat: 'Account' },
    { title: 'Notifications',        url: 'notifications.html',    icon: '🔔', cat: 'Account' },
    { title: 'Mentor Dashboard',     url: 'mentor-dashboard.html', icon: '🎓', cat: 'Roles' },
    { title: 'Admin Panel',          url: 'admin.html',            icon: '🛡️', cat: 'Roles' },
    { title: 'Become a Mentor',      url: 'become-mentor.html',    icon: '🌟', cat: 'Public' },
    { title: 'Messages',             url: 'messages.html',         icon: '✉️', cat: 'Pages' },
    { title: 'Search',               url: 'search.html',           icon: '🔍', cat: 'Pages' },
  ];

  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'es-search-modal';
  modal.style.cssText = `display:none;position:fixed;inset:0;z-index:8000;background:rgba(13,13,13,0.6);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding:80px 24px 24px;`;
  modal.innerHTML = `
    <div style="background:var(--cream);border-radius:20px;width:100%;max-width:560px;overflow:hidden;box-shadow:var(--shadow-lg);">
      <div style="display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--border);">
        <span style="font-size:18px;color:var(--muted);">🔍</span>
        <input id="es-search-input" placeholder="Search pages, tools, guides…" style="flex:1;border:none;background:transparent;font-family:var(--font-body);font-size:16px;color:var(--ink);outline:none;" autofocus>
        <kbd style="background:var(--paper);border:1px solid var(--border);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--muted);">ESC</kbd>
      </div>
      <div id="es-search-results" style="max-height:380px;overflow-y:auto;padding:8px;"></div>
      <div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);display:flex;gap:16px;">
        <span>↑↓ Navigate</span><span>Enter Select</span><span>Esc Close</span>
      </div>
    </div>`;
  document.body.appendChild(modal);

  function renderResults(query) {
    const container = document.getElementById('es-search-results');
    const filtered = query.length > 0
      ? pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.cat.toLowerCase().includes(query.toLowerCase()))
      : pages;

    if (!filtered.length) {
      container.innerHTML = `<div style="text-align:center;padding:28px;color:var(--muted);font-size:14px;">No results found for "<strong>${query}</strong>"</div>`;
      return;
    }

    const grouped = {};
    filtered.forEach(p => { if (!grouped[p.cat]) grouped[p.cat] = []; grouped[p.cat].push(p); });

    container.innerHTML = Object.entries(grouped).map(([cat, items]) => `
      <div style="padding:8px 12px 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);">${cat}</div>
      ${items.map(item => `
        <a href="${item.url}" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;text-decoration:none;color:var(--ink);transition:background .15s;" onmouseenter="this.style.background='var(--paper)'" onmouseleave="this.style.background=''">
          <span style="font-size:20px;width:28px;text-align:center;">${item.icon}</span>
          <span style="font-size:14px;font-weight:500;">${item.title}</span>
          <span style="margin-left:auto;font-size:12px;color:var(--muted);">→</span>
        </a>`).join('')}`).join('');
  }

  document.getElementById('es-search-input').addEventListener('input', e => renderResults(e.target.value));

  modal.addEventListener('click', e => { if (e.target === modal) closeSearchModal(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearchModal(); }
    if (e.key === 'Escape') closeSearchModal();
  });

  renderResults('');
}

function openSearchModal() {
  const modal = document.getElementById('es-search-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const inp = document.getElementById('es-search-input'); if (inp) inp.focus(); }, 50);
}

function closeSearchModal() {
  const modal = document.getElementById('es-search-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ── AUTO-INIT ON DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initTabs();
  initMobileNav();
  animateProgressBars();
  initSearchModal();
  updateNotifBadge(7);

  // Add Cmd+K hint to topbar search buttons
  document.querySelectorAll('[data-search-trigger]').forEach(btn => {
    btn.addEventListener('click', openSearchModal);
  });
});

/* ── EXPORT FOR MODULE USE ── */
if (typeof window !== 'undefined') {
  window.ES = {
    showToast, esConfirm, openModal, closeModal,
    openSearchModal, closeSearchModal,
    filterItems, store, currentUser,
    renderMiniBar, renderDonut, renderHeatmap,
    formatINR, timeAgo, formatDate,
    debounce, validateForm, copyToClipboard, scrollTo,
  };
}
