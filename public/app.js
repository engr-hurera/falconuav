function openQuote(drone = 'General Inquiry') {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('open');
  const input = document.getElementById('quoteDrone');
  if (input) input.value = drone;
}
function closeModal() {
  const modal = document.getElementById('quoteModal');
  if (modal) modal.classList.remove('open');
}
async function postForm(form, endpoint, successCallback) {
  const response = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
  const data = await response.json();
  alert(data.message);
  if (data.ok && successCallback) successCallback(form);
}
async function submitQuote(e) { e.preventDefault(); await postForm(e.target, '/api/quote', f => { f.reset(); closeModal(); }); }
async function submitOrder(e) { e.preventDefault(); await postForm(e.target, '/api/order', f => f.reset()); }
window.addEventListener('click', e => { if (e.target.classList.contains('modal')) closeModal(); });
