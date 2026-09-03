function openQuote(drone = 'General Inquiry') {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const input = document.getElementById('quoteDrone');
  if (input) input.value = drone;
  const first = modal.querySelector('input[name="name"]');
  setTimeout(() => first?.focus(), 80);
}
function closeModal() {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
function setStatus(form, message, type) {
  const status = form.querySelector('.form-status');
  if (!status) return;
  status.textContent = message;
  status.className = `form-status ${type || ''}`;
}
async function postForm(form, endpoint) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) { submit.disabled = true; submit.dataset.original = submit.textContent; submit.textContent = 'Sending…'; }
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await response.json().catch(() => ({ok:false,message:'Something went wrong. Please try again.'}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'Unable to send your request.');
    setStatus(form, data.message, 'success');
    form.reset();
    if (endpoint === '/api/quote') setTimeout(closeModal, 1800);
  } catch (error) { setStatus(form, error.message, 'error'); }
  finally { if (submit) { submit.disabled = false; submit.textContent = submit.dataset.original || 'Submit'; } }
}
async function submitQuote(e) { e.preventDefault(); await postForm(e.target, '/api/quote'); }
async function submitOrder(e) { e.preventDefault(); await postForm(e.target, '/api/order'); }
function openLightbox(src, caption) {
  const box = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  const text = document.getElementById('lightboxCaption');
  if (!box || !image) return;
  image.src = src; image.alt = caption; if (text) text.textContent = caption;
  box.classList.add('open'); box.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function closeLightbox() {
  const box = document.getElementById('lightbox');
  if (!box) return;
  box.classList.remove('open'); box.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  toggle?.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeLightbox(); } });
  document.getElementById('quoteModal')?.addEventListener('click', e => { if (e.target.classList.contains('modal')) closeModal(); });
  document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
});
