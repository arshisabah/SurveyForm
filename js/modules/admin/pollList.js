import { pollsService } from '../../services/pollsService.js';
import { searchAndFilter } from '../../utils/searchFilter.js';
import { STATUS } from '../../constants/status.js';

const root = document.getElementById('admin-polls-list');
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
  const polls = searchAndFilter(pollsService.all(), searchEl?.value || '', statusEl?.value || 'all', 'question');

  root.innerHTML = `
    <div class="admin-filter-row">
      <input id="polls-search" placeholder="Search polls by question" />
      <select id="polls-status-filter">
        <option value="all">All statuses</option>
        <option value="${STATUS.ACTIVE}">Active</option>
        <option value="${STATUS.INACTIVE}">Inactive</option>
      </select>
    </div>
    <div class="admin-list" id="polls-list-body"></div>
  `;

  searchEl = document.getElementById('polls-search');
  statusEl = document.getElementById('polls-status-filter');
  searchEl.addEventListener('input', render);
  statusEl.addEventListener('change', render);

  const listBody = document.getElementById('polls-list-body');
  listBody.innerHTML = polls.map(poll => `
    <div class="catalog-item admin-list-item">
      <div class="admin-list-main">
        <div class="admin-list-title-row">
          <strong>${escapeHtml(poll.question)}</strong>
          <span class="badge ${poll.status}">${poll.status}</span>
        </div>
        <div class="small">${poll.options.length} options • ${poll.choiceType}</div>
      </div>
      <div class="list-actions">
        <button data-id="${poll.id}" data-action="edit">Edit</button>
        <button data-id="${poll.id}" data-action="toggle">${poll.status === STATUS.ACTIVE ? 'Disable' : 'Enable'}</button>
        <button data-id="${poll.id}" data-action="delete" class="btn-danger">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No polls found.</p>';

  listBody.querySelectorAll('button[data-action]').forEach(button => {
    button.onclick = () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'edit') window.dispatchEvent(new CustomEvent('admin:edit-poll', { detail: { pollId: id } }));
      if (action === 'toggle') {
        const item = polls.find(item => item.id === id);
        pollsService.update(id, { status: item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE });
        window.dispatchEvent(new Event('admin:data-changed'));
      }
      if (action === 'delete' && confirm('Delete this poll?')) {
        pollsService.remove(id);
        window.dispatchEvent(new Event('admin:data-changed'));
      }
      render();
    };
  });
}