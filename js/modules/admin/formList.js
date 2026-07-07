import { formsService } from '../../services/formsService.js';

const root = document.getElementById('admin-forms-list');
if (root) render();

function render() {
  const forms = formsService.all();
  root.innerHTML = forms.map(f => `
    <div class="catalog-item">
      <div>
        <strong>${f.name}</strong>
        <div class="small">${f.fields.length} fields • ${f.submissionType}</div>
        <span class="badge ${f.status}">${f.status}</span>
      </div>
      <div class="list-actions">
        <button data-id="${f.id}" data-action="toggle">Toggle</button>
        <button data-id="${f.id}" data-action="delete" class="btn-danger">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No forms yet.</p>';

  root.querySelectorAll('button[data-action]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'toggle') {
        const item = forms.find(x=>x.id===id);
        formsService.update(id, { status: item.status === 'active' ? 'inactive' : 'active' });
      }
      if (action === 'delete') formsService.remove(id);
      render();
    };
  });
}
