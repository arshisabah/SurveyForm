import { formsService } from '../../services/formsService.js';
import { responsesService } from '../../services/responsesService.js';
import { searchAndFilter } from '../../utils/searchFilter.js';
import { STATUS } from '../../constants/status.js';

const root = document.getElementById('admin-forms-list');
let searchEl;
let statusEl;

if (root) {
  window.addEventListener('admin:data-changed', render);
  render();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function render() {
  const forms = searchAndFilter(formsService.all(), searchEl?.value || '', statusEl?.value || 'all', 'name');
  const responseCounts = responsesService.allFormResponses().reduce((counts, response) => {
    counts[response.formId] = (counts[response.formId] || 0) + 1;
    return counts;
  }, {});

  root.innerHTML = `
    <div class="admin-filter-row">
      <input id="forms-search" placeholder="Search forms by name" />
      <select id="forms-status-filter">
        <option value="all">All statuses</option>
        <option value="${STATUS.ACTIVE}">Active</option>
        <option value="${STATUS.INACTIVE}">Inactive</option>
      </select>
    </div>
    <div class="admin-list" id="forms-list-body"></div>
  `;

  searchEl = document.getElementById('forms-search');
  statusEl = document.getElementById('forms-status-filter');
  searchEl.addEventListener('input', render);
  statusEl.addEventListener('change', render);

  const listBody = document.getElementById('forms-list-body');
  listBody.innerHTML = forms.map(form => `
    <div class="catalog-item admin-list-item">
      <div class="admin-list-main">
        <div class="admin-list-title-row">
          <strong>${escapeHtml(form.name)}</strong>
          <span class="badge ${form.status}">${form.status}</span>
        </div>
        <div class="small">${form.fields.length} fields • ${form.submissionType} • ${responseCounts[form.id] || 0} responses</div>
      </div>
      <div class="list-actions">
        <button data-id="${form.id}" data-action="edit">Edit</button>
        <button data-id="${form.id}" data-action="toggle">${form.status === STATUS.ACTIVE ? 'Disable' : 'Enable'}</button>
        <button data-id="${form.id}" data-action="responses">Responses</button>
        <button data-id="${form.id}" data-action="delete" class="btn-danger">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No forms found.</p>';

  listBody.querySelectorAll('button[data-action]').forEach(button => {
    button.onclick = () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'edit') window.dispatchEvent(new CustomEvent('admin:edit-form', { detail: { formId: id } }));
      if (action === 'toggle') {
        const item = forms.find(item => item.id === id);
        formsService.update(id, { status: item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE });
        window.dispatchEvent(new Event('admin:data-changed'));
      }
      if (action === 'responses') window.dispatchEvent(new CustomEvent('admin:view-form-responses', { detail: { formId: id } }));
      if (action === 'delete' && confirm('Delete this form?')) {
        formsService.remove(id);
        window.dispatchEvent(new Event('admin:data-changed'));
      }
      render();
    };
  });
}
