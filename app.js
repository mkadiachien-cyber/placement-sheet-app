/* ═══════════════════════════════════════
   Placement Sheet Generator — app.js
═══════════════════════════════════════ */

// ── Image slot config ──────────────────
const SLOTS = {
  artwork:   { img: 'img-artwork',   sbPrev: 'prev-artwork',   sbPh: 'ph-artwork',   sbFn: 'fn-artwork',   shPh: 'ph-artwork-sheet' },
  color:     { img: 'img-color',     sbPrev: 'prev-color',     sbPh: 'ph-color',     sbFn: 'fn-color',     shPh: 'ph-color-sheet' },
  style:     { img: 'img-style',     sbPrev: 'prev-style',     sbPh: 'ph-style',     sbFn: 'fn-style',     shPh: 'ph-style-sheet' },
  placement: { img: 'img-placement', sbPrev: 'prev-placement', sbPh: 'ph-placement', sbFn: 'fn-placement', shPh: 'ph-placement-sheet' },
};

// ── Upload handler ─────────────────────
document.querySelectorAll('.upload-zone input[type=file]').forEach(input => {
  input.addEventListener('change', () => handleFile(input));
});

function handleFile(input) {
  const file = input.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const target = input.closest('.upload-zone').dataset.target || input.dataset.target;
  const reader = new FileReader();
  reader.onload = e => applyImage(target, e.target.result, file.name);
  reader.readAsDataURL(file);
}

function applyImage(target, src, filename) {
  const s = SLOTS[target];
  // Sidebar preview
  const prev = document.getElementById(s.sbPrev);
  const ph   = document.getElementById(s.sbPh);
  const fn   = document.getElementById(s.sbFn);
  prev.src = src;
  prev.classList.add('show');
  ph.classList.add('hide');
  if (fn) fn.textContent = filename || '';

  // Sheet image
  const img   = document.getElementById(s.img);
  const shPh  = document.getElementById(s.shPh);
  if (img)  { img.src = src; img.style.display = 'block'; }
  if (shPh) { shPh.style.display = 'none'; }
}

// ── Drag and drop on upload zones ──────
document.querySelectorAll('.upload-zone').forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const target = zone.dataset.target;
    const reader = new FileReader();
    reader.onload = ev => applyImage(target, ev.target.result, file.name);
    reader.readAsDataURL(file);
  });
});

// Upload zones need data-target on the label (not just the input)
document.querySelectorAll('.upload-zone').forEach(zone => {
  const input = zone.querySelector('input[type=file]');
  if (input && input.dataset.target) {
    zone.dataset.target = input.dataset.target;
  }
});

// ── Column width sliders ───────────────
const sliders = {
  left:  document.getElementById('sl-left'),
  mid:   document.getElementById('sl-mid'),
  right: document.getElementById('sl-right'),
};
const labels = {
  left:  document.getElementById('lv-left'),
  mid:   document.getElementById('lv-mid'),
  right: document.getElementById('lv-right'),
};

function updateLayout() {
  const l = parseFloat(sliders.left.value);
  const m = parseFloat(sliders.mid.value);
  const r = parseFloat(sliders.right.value);
  labels.left.textContent  = l.toFixed(2);
  labels.mid.textContent   = m.toFixed(2);
  labels.right.textContent = r.toFixed(2);
  document.getElementById('headerPanels').style.gridTemplateColumns = `${l}fr ${m}fr ${r}fr`;
}

Object.values(sliders).forEach(sl => sl.addEventListener('input', updateLayout));
updateLayout(); // init

// ── Helpers ───────────────────────────
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function showLoading() { $('loading').classList.add('active'); }
function hideLoading() { $('loading').classList.remove('active'); }

function toast(msg, duration = 2800) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// Temporarily disable contenteditable hover/focus styles for clean capture
function addExportStyle() {
  const s = document.createElement('style');
  s.id = '__export_style';
  s.textContent = `
    [contenteditable]:hover,
    [contenteditable]:focus {
      background: transparent !important;
      box-shadow: none !important;
    }
    .img-ph { border-style: solid !important; border-color: #eee !important; }
  `;
  document.head.appendChild(s);
}
function removeExportStyle() {
  document.getElementById('__export_style')?.remove();
}

// ── Export JPG ────────────────────────
async function exportJPG() {
  showLoading();
  addExportStyle();
  await sleep(120);
  try {
    const canvas = await html2canvas($('sheet'), {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `placement-sheet-${timestamp()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    toast('✓ JPG downloaded');
  } catch (err) {
    console.error(err);
    toast('Export failed — check console');
  }
  removeExportStyle();
  hideLoading();
}

// ── Export PDF ────────────────────────
async function exportPDF() {
  showLoading();
  addExportStyle();
  await sleep(120);
  try {
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas($('sheet'), {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    // A4 landscape
    const pdf  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();   // 297
    const pdfH = pdf.internal.pageSize.getHeight();  // 210
    const ratio = canvas.height / canvas.width;
    const drawW = pdfW;
    const drawH = drawW * ratio;
    const yOff  = drawH < pdfH ? (pdfH - drawH) / 2 : 0;
    pdf.addImage(imgData, 'JPEG', 0, yOff, drawW, Math.min(drawH, pdfH));
    pdf.save(`placement-sheet-${timestamp()}.pdf`);
    toast('✓ PDF downloaded');
  } catch (err) {
    console.error(err);
    toast('Export failed — check console');
  }
  removeExportStyle();
  hideLoading();
}

// ── Reset ─────────────────────────────
function resetAll() {
  Object.entries(SLOTS).forEach(([target, s]) => {
    // Clear sidebar
    const prev = document.getElementById(s.sbPrev);
    const ph   = document.getElementById(s.sbPh);
    const fn   = document.getElementById(s.sbFn);
    if (prev) { prev.src = ''; prev.classList.remove('show'); }
    if (ph)   { ph.classList.remove('hide'); }
    if (fn)   { fn.textContent = ''; }
    // Clear file inputs
    document.querySelectorAll(`[data-target="${target}"]`).forEach(el => {
      if (el.tagName === 'INPUT') el.value = '';
    });
    // Hide sheet image, show placeholder
    const img  = document.getElementById(s.img);
    const shPh = document.getElementById(s.shPh);
    if (img)  { img.src = ''; img.style.display = 'none'; }
    if (shPh) { shPh.style.display = ''; }
  });
  // Reset sliders
  sliders.left.value  = 1.0;
  sliders.mid.value   = 1.15;
  sliders.right.value = 0.6;
  updateLayout();
  toast('↺ Reset complete');
}

// ── Utility ───────────────────────────
function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
function pad(n) { return String(n).padStart(2,'0'); }
