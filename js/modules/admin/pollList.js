import { pollsService } from '../../services/pollsService.js';

const root = document.getElementById('admin-polls-list');
if (root) render();

function render() {
  const polls = pollsService.all();
  root.innerHTML = polls.map(p => `
    <div class="catalog-item">
      <div>
        <strong>${p.question}</strong>
        <div class="small">${p.options.length} options • ${p.choiceType}</div>
        <span class="badge ${p.status}">${p.status}</span>
      </div>
      <div class="list-actions">
        <button data-id="${p.id}" data-action="toggle">Toggle</button>
        <button data-id="${p.id}" data-action="delete" class="btn-danger">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No polls yet.</p>';

  root.querySelectorAll('button[data-action]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'toggle') {
        const item = polls.find(x=>x.id===id);
        pollsService.update(id, { status: item.status === 'active' ? 'inactive' : 'active' });
      }
      if (action === 'delete') pollsService.remove(id);
      render();
    };
  });
}
