import { pollsService } from '../../services/pollsService.js';
import { searchAndFilter } from '../../utils/searchFilter.js';

const root = document.getElementById('polls-catalog');
const searchEl = document.getElementById('polls-search');
const statusEl = document.getElementById('polls-status-filter');
if (root && searchEl && statusEl) {
  render();
  searchEl.addEventListener('input', render);
  statusEl.addEventListener('change', render);
}

function render() {
  const list = searchAndFilter(pollsService.all(), searchEl.value, statusEl.value, 'question');
  root.innerHTML = list.map(p => `
    <div class="catalog-item">
      <div><strong>${p.question}</strong> <span class="badge ${p.status}">${p.status}</span></div>
      <button data-id="${p.id}">Open</button>
    </div>
  `).join('') || '<p class="muted">No polls found.</p>';

  root.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = () => window.dispatchEvent(new CustomEvent('poll:selected', { detail: { pollId: btn.dataset.id } }));
  });
}
