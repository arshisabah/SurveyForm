import { formsService } from '../../services/formsService.js';
import { responsesService } from '../../services/responsesService.js';
import { FIELD_TYPES } from '../../constants/fieldTypes.js';
import { STATUS } from '../../constants/status.js';
import { toPct } from '../../utils/percentage.js';
import { downloadCsv } from '../../utils/csvExport.js';

const root = document.getElementById('form-responses-panel');
const CHOICE_TYPES = [FIELD_TYPES.DROPDOWN, FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX];

let selectedFormId = '';
let activeTab = 'summary'; // summary | individual | table
let currentIndex = 0;
let tableSearch = '';

if (root) {
  window.addEventListener('admin:data-changed', render);
  window.addEventListener('admin:view-form-responses', (event) => {
    selectedFormId = event.detail?.formId || '';
    activeTab = 'summary';
    currentIndex = 0;
    render();
  });
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

function displayValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function respondentName(response) {
  return response.userName || response.userId || 'Anonymous';
}

function render() {
  const forms = formsService.all();
  if (!forms.length) {
    root.innerHTML = '<p class="muted">Create a form first to inspect submissions.</p>';
    return;
  }

  if (!selectedFormId || !forms.some(form => form.id === selectedFormId)) {
    selectedFormId = forms[0].id;
  }

  const form = forms.find(item => item.id === selectedFormId);
  const responses = responsesService.allFormResponses()
    .filter(response => response.formId === selectedFormId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const uniqueUsers = new Set(responses.map(response => response.userId || response.userName || 'anonymous')).size;
  const lastSubmitted = responses[0] ? new Date(responses[0].submittedAt).toLocaleString() : '—';

  root.innerHTML = `
    <div class="builder-top-grid response-summary">
      <label class="builder-field">
        <span>Select form</span>
        <select id="responses-form-select">
          ${forms.map(item => `<option value="${item.id}" ${item.id === selectedFormId ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
        </select>
      </label>
      <div class="summary-pill"><span>Total responses</span><strong>${responses.length}</strong></div>
      <div class="summary-pill"><span>Unique respondents</span><strong>${uniqueUsers}</strong></div>
    </div>
    <div class="responses-toolbar">
      <div class="tabs" role="tablist">
        <button class="tab-btn ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">Summary</button>
        <button class="tab-btn ${activeTab === 'individual' ? 'active' : ''}" data-tab="individual">Individual</button>
        <button class="tab-btn ${activeTab === 'table' ? 'active' : ''}" data-tab="table">All responses</button>
      </div>
      <div class="responses-toolbar-actions">
        <span class="small">Last submission: ${lastSubmitted}</span>
        <button id="toggle-accepting" class="${form.status === STATUS.ACTIVE ? '' : 'btn-primary'}">
          ${form.status === STATUS.ACTIVE ? 'Stop accepting responses' : 'Start accepting responses'}
        </button>
        <button id="export-csv">Export CSV</button>
      </div>
    </div>
    <div id="responses-tab-body"></div>
  `;

  document.getElementById('responses-form-select').onchange = (event) => {
    selectedFormId = event.target.value;
    currentIndex = 0;
    render();
  };

  document.getElementById('toggle-accepting').onclick = () => {
    formsService.update(form.id, { status: form.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE });
    window.dispatchEvent(new Event('admin:data-changed'));
  };

  document.getElementById('export-csv').onclick = () => exportResponsesCsv(form, responses);

  root.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.dataset.tab;
      currentIndex = 0;
      render();
    };
  });

  const body = document.getElementById('responses-tab-body');
  if (!responses.length) {
    body.innerHTML = '<p class="muted">No submissions yet for this form.</p>';
    return;
  }

  if (activeTab === 'summary') renderSummary(body, form, responses);
  if (activeTab === 'individual') renderIndividual(body, form, responses);
  if (activeTab === 'table') renderTable(body, form, responses);
}

function renderSummary(body, form, responses) {
  body.innerHTML = `
    <div class="summary-fields">
      ${form.fields.map(field => {
        if (CHOICE_TYPES.includes(field.type)) {
          const counts = {};
          field.options.forEach(option => { counts[option] = 0; });
          let answered = 0;
          responses.forEach(response => {
            const value = response.answers?.[field.id];
            const values = Array.isArray(value) ? value : (value ? [value] : []);
            if (values.length) answered += 1;
            values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
          });
          return `
            <div class="summary-field-card">
              <div class="summary-field-head">
                <strong>${escapeHtml(field.label)}</strong>
                <span class="small">${answered} of ${responses.length} answered</span>
              </div>
              ${field.options.map(option => {
                const count = counts[option] || 0;
                const pct = toPct(count, responses.length);
                return `
                  <div class="bar-row">
                    <span class="bar-label">${escapeHtml(option)}</span>
                    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                    <span class="bar-value">${count} (${pct}%)</span>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        const answers = responses
          .map(response => ({ value: response.answers?.[field.id], name: respondentName(response), at: response.submittedAt }))
          .filter(item => item.value !== undefined && item.value !== null && item.value !== '');

        return `
          <div class="summary-field-card">
            <div class="summary-field-head">
              <strong>${escapeHtml(field.label)}</strong>
              <span class="small">${answers.length} of ${responses.length} answered</span>
            </div>
            <div class="text-answers">
              ${answers.length ? answers.slice(0, 8).map(item => `
                <div class="text-answer-row">
                  <span>${escapeHtml(displayValue(item.value))}</span>
                  <span class="small">${escapeHtml(item.name)}</span>
                </div>
              `).join('') : '<p class="muted">No answers yet.</p>'}
              ${answers.length > 8 ? `<p class="small">+ ${answers.length - 8} more</p>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderIndividual(body, form, responses) {
  if (currentIndex >= responses.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = responses.length - 1;
  const response = responses[currentIndex];

  body.innerHTML = `
    <div class="individual-pager">
      <button id="prev-response" ${responses.length < 2 ? 'disabled' : ''}>&larr; Prev</button>
      <span>Response ${currentIndex + 1} of ${responses.length}</span>
      <button id="next-response" ${responses.length < 2 ? 'disabled' : ''}>Next &rarr;</button>
    </div>
    <article class="response-card">
      <div class="response-card-head">
        <div>
          <strong>${escapeHtml(respondentName(response))}</strong>
          <div class="small">${new Date(response.submittedAt).toLocaleString()}</div>
        </div>
        <button class="btn-danger" id="delete-response">Delete</button>
      </div>
      <div class="response-answers">
        ${form.fields.map(field => `
          <div class="response-answer">
            <span>${escapeHtml(field.label)}</span>
            <strong>${escapeHtml(displayValue(response.answers?.[field.id]))}</strong>
          </div>
        `).join('')}
      </div>
    </article>
  `;

  document.getElementById('prev-response').onclick = () => { currentIndex -= 1; render(); };
  document.getElementById('next-response').onclick = () => { currentIndex += 1; render(); };
  document.getElementById('delete-response').onclick = () => {
    if (!confirm('Delete this response?')) return;
    responsesService.removeFormResponse(response.id);
    window.dispatchEvent(new Event('admin:data-changed'));
  };
}

function filteredTableResponses(form, responses) {
  const q = tableSearch.toLowerCase().trim();
  if (!q) return responses;
  return responses.filter(response => {
    const haystack = [respondentName(response), ...form.fields.map(field => displayValue(response.answers?.[field.id]))]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

function renderTable(body, form, responses) {
  const rows = filteredTableResponses(form, responses);

  body.innerHTML = `
    <div class="admin-filter-row">
      <input id="table-search" placeholder="Search by respondent or answer" value="${escapeHtml(tableSearch)}" />
      <span class="small">${rows.length} of ${responses.length} shown</span>
    </div>
    <div class="table-wrap">
      <table class="responses-table">
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Respondent</th>
            ${form.fields.map(field => `<th>${escapeHtml(field.label)}</th>`).join('')}
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(response => `
            <tr data-id="${response.id}">
              <td>${new Date(response.submittedAt).toLocaleString()}</td>
              <td>${escapeHtml(respondentName(response))}</td>
              ${form.fields.map(field => `<td>${escapeHtml(displayValue(response.answers?.[field.id]))}</td>`).join('')}
              <td><button class="btn-danger" data-action="delete-row">Delete</button></td>
            </tr>
          `).join('') || `<tr><td colspan="${form.fields.length + 3}" class="muted">No matching responses.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  const searchInput = document.getElementById('table-search');
  searchInput.oninput = (event) => {
    tableSearch = event.target.value;
    renderTable(body, form, responses);
  };
  searchInput.focus();
  searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);

  body.querySelectorAll('[data-action="delete-row"]').forEach(button => {
    button.onclick = () => {
      const row = button.closest('tr');
      if (!confirm('Delete this response?')) return;
      responsesService.removeFormResponse(row.dataset.id);
      window.dispatchEvent(new Event('admin:data-changed'));
    };
  });
}

function exportResponsesCsv(form, responses) {
  const headers = ['Submitted At', 'Respondent', ...form.fields.map(field => field.label)];
  const rows = responses.map(response => [
    new Date(response.submittedAt).toLocaleString(),
    respondentName(response),
    ...form.fields.map(field => displayValue(response.answers?.[field.id]))
  ]);
  downloadCsv(`${form.name.replace(/\s+/g, '_')}_responses.csv`, headers, rows);
}
