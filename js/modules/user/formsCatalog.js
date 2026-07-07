import { formsService } from '../../services/formsService.js';
import { searchAndFilter } from '../../utils/searchFilter.js';

const root = document.getElementById('forms-catalog');
const searchEl = document.getElementById('forms-search');
const statusEl = document.getElementById('forms-status-filter');
if (root && searchEl && statusEl) {
  render();
  searchEl.addEventListener('input', render);
  statusEl.addEventListener('change', render);
}

function render() {
  const list = searchAndFilter(formsService.all(), searchEl.value, statusEl.value, 'name');
  root.innerHTML = list.map(f => `
    <div class="catalog-item">
      <div><strong>${f.name}</strong> <span class="badge ${f.status}">${f.status}</span></div>
      <button data-id="${f.id}">Open</button>
    </div>
  `).join('') || '<p class="muted">No forms found.</p>';

  root.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = () => {
      window.dispatchEvent(new CustomEvent('form:selected', { detail: { formId: btn.dataset.id } }));
    };
  });
}
