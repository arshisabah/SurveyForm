import { FIELD_TYPES } from '../../constants/fieldTypes.js';
import { SUBMISSION_TYPES } from '../../constants/submissionTypes.js';
import { STATUS } from '../../constants/status.js';
import { formsService } from '../../services/formsService.js';
import { genId } from '../../utils/id.js';

const root = document.getElementById('form-builder');
const optionFieldTypes = [FIELD_TYPES.DROPDOWN, FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX];

const FIELD_TYPE_ICON = {
  [FIELD_TYPES.TEXT]: 'Aa',
  [FIELD_TYPES.NUMBER]: '123',
  [FIELD_TYPES.DATE]: '📅',
  [FIELD_TYPES.DROPDOWN]: '▾',
  [FIELD_TYPES.RADIO]: '◉',
  [FIELD_TYPES.CHECKBOX]: '☑',
  [FIELD_TYPES.TEXTAREA]: '¶'
};

const FIELD_TYPE_LABEL = {
  [FIELD_TYPES.TEXT]: 'Short text',
  [FIELD_TYPES.NUMBER]: 'Number',
  [FIELD_TYPES.DATE]: 'Date',
  [FIELD_TYPES.DROPDOWN]: 'Dropdown',
  [FIELD_TYPES.RADIO]: 'Radio button',
  [FIELD_TYPES.CHECKBOX]: 'Checkbox',
  [FIELD_TYPES.TEXTAREA]: 'Paragraph'
};

let editingFormId = null;
let fieldState = [];
let expandedFieldId = null;
let previewOpen = false;

if (root) {
  window.addEventListener('admin:edit-form', (event) => loadForEdit(event.detail?.formId));
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

function createField() {
  return {
    id: genId(),
    label: '',
    type: FIELD_TYPES.TEXT,
    required: false,
    options: [],
    placeholder: '',
    helpText: ''
  };
}

function loadForEdit(formId) {
  const form = formsService.all().find(item => item.id === formId);
  if (!form) return;
  editingFormId = form.id;
  fieldState = (form.fields || []).map(field => ({
    id: field.id || genId(),
    label: field.label || '',
    type: field.type || FIELD_TYPES.TEXT,
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    placeholder: field.placeholder || '',
    helpText: field.helpText || ''
  }));
  expandedFieldId = null;
  previewOpen = false;
  render(form);
  root.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetBuilder() {
  editingFormId = null;
  fieldState = [];
  expandedFieldId = null;
  previewOpen = false;
  render();
}

function renderPreviewInput(field) {
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
  if (['text', 'number', 'date'].includes(field.type)) return `<input type="${field.type}" disabled${placeholder} />`;
  if (field.type === FIELD_TYPES.TEXTAREA) return `<textarea disabled rows="2"${placeholder}></textarea>`;
  if (field.type === FIELD_TYPES.DROPDOWN) return `<select disabled><option>Select</option>${(field.options || []).map(o => `<option>${escapeHtml(o)}</option>`).join('')}</select>`;
  if (field.type === FIELD_TYPES.RADIO) return (field.options || []).map(o => `<label class="preview-choice"><input type="radio" disabled /> ${escapeHtml(o)}</label>`).join('') || '<p class="muted small">No options configured yet.</p>';
  if (field.type === FIELD_TYPES.CHECKBOX) return (field.options || []).map(o => `<label class="preview-choice"><input type="checkbox" disabled /> ${escapeHtml(o)}</label>`).join('') || '<p class="muted small">No options configured yet.</p>';
  return '';
}

function render(form = null) {
  root.innerHTML = `
    <div class="builder-toolbar">
      <div>
        <p class="eyebrow">Form configuration</p>
        <h3>${editingFormId ? 'Edit form' : 'New form'}</h3>
      </div>
      <div class="builder-actions">
        <button id="toggle-preview" type="button">${previewOpen ? 'Hide preview' : 'Preview'}</button>
        <button id="clear-form" type="button">${editingFormId ? 'Cancel edit' : 'Reset'}</button>
      </div>
    </div>
    <div class="builder-top-grid">
      <label class="builder-field">
        <span>Form name</span>
        <input id="form-name" placeholder="Event Registration" value="${escapeHtml(form?.name || '')}" />
      </label>
      <label class="builder-field">
        <span>Submission type</span>
        <select id="submission-type">
          <option value="${SUBMISSION_TYPES.SINGLE}" ${!form || form.submissionType === SUBMISSION_TYPES.SINGLE ? 'selected' : ''}>Single Submission</option>
          <option value="${SUBMISSION_TYPES.MULTIPLE}" ${form?.submissionType === SUBMISSION_TYPES.MULTIPLE ? 'selected' : ''}>Multiple Submission</option>
        </select>
      </label>
      <label class="builder-field">
        <span>Status</span>
        <select id="form-status">
          <option value="${STATUS.ACTIVE}" ${!form || form.status === STATUS.ACTIVE ? 'selected' : ''}>Active</option>
          <option value="${STATUS.INACTIVE}" ${form?.status === STATUS.INACTIVE ? 'selected' : ''}>Inactive</option>
        </select>
      </label>
    </div>
    <p class="muted builder-note">Click a question to expand it. Use ↑ ↓ to reorder, ⧉ to duplicate. Option fields use one option per line.</p>
    <div class="builder-body">
      <div id="fields-wrap" class="builder-fields-col"></div>
      <div id="preview-pane" class="preview-pane ${previewOpen ? '' : 'hidden'}"></div>
    </div>
    <div class="builder-footer">
      <button id="add-field" type="button">+ Add field</button>
      <button id="save-form" type="button" class="btn-primary">${editingFormId ? 'Update form' : 'Save form'}</button>
    </div>
  `;

  const fieldsWrap = document.getElementById('fields-wrap');
  const previewPane = document.getElementById('preview-pane');
  const nameInput = document.getElementById('form-name');

  document.getElementById('toggle-preview').onclick = () => {
    previewOpen = !previewOpen;
    previewPane.classList.toggle('hidden', !previewOpen);
    document.getElementById('toggle-preview').textContent = previewOpen ? 'Hide preview' : 'Preview';
    drawPreview();
  };

  document.getElementById('clear-form').onclick = resetBuilder;
  document.getElementById('add-field').onclick = () => {
    const field = createField();
    fieldState.push(field);
    expandedFieldId = field.id;
    drawFields();
  };
  nameInput.addEventListener('input', drawPreview);

  function drawPreview() {
    if (!previewOpen) return;
    previewPane.innerHTML = `
      <div class="preview-card">
        <p class="eyebrow">Live preview</p>
        <h4>${escapeHtml(nameInput.value || 'Untitled form')}</h4>
        ${fieldState.length ? fieldState.map(field => `
          <div class="preview-field">
            <label>${escapeHtml(field.label || 'Untitled question')}${field.required ? ' <span class="req-star">*</span>' : ''}</label>
            ${field.helpText ? `<div class="small">${escapeHtml(field.helpText)}</div>` : ''}
            ${renderPreviewInput(field)}
          </div>
        `).join('') : '<p class="muted">Add fields to see the live preview.</p>'}
        <button class="btn-primary" disabled>Submit</button>
      </div>
    `;
  }

  function drawFields() {
    fieldsWrap.innerHTML = fieldState.length ? fieldState.map((field, index) => {
      const isExpanded = expandedFieldId === field.id;
      return `
      <div class="field-editor card ${isExpanded ? 'expanded' : 'collapsed'}" data-id="${field.id}">
        <div class="field-editor-head" data-action="toggle-expand">
          <div class="field-summary">
            <span class="field-type-badge">${FIELD_TYPE_ICON[field.type] || '?'}</span>
            <div>
              <strong>${escapeHtml(field.label) || `Question ${index + 1}`}</strong>
              <div class="small">${FIELD_TYPE_LABEL[field.type]}${field.required ? ' • Required' : ''}</div>
            </div>
          </div>
          <div class="field-editor-controls">
            <button data-k="move-up" type="button" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button data-k="move-down" type="button" title="Move down" ${index === fieldState.length - 1 ? 'disabled' : ''}>↓</button>
            <button data-k="duplicate" type="button" title="Duplicate">⧉</button>
            <button data-k="remove" class="btn-danger" type="button" title="Delete">Delete</button>
          </div>
        </div>
        <div class="field-editor-body ${isExpanded ? '' : 'hidden'}">
          <div class="field-editor-grid">
            <label class="builder-field"><span>Label</span><input data-k="label" placeholder="Name" value="${escapeHtml(field.label)}" /></label>
            <label class="builder-field"><span>Type</span>
              <select data-k="type">
                ${Object.values(FIELD_TYPES).map(type => `<option value="${type}" ${field.type === type ? 'selected' : ''}>${FIELD_TYPE_LABEL[type]}</option>`).join('')}
              </select>
            </label>
            <label class="builder-field"><span>Placeholder</span><input data-k="placeholder" placeholder="Enter a short hint" value="${escapeHtml(field.placeholder)}" /></label>
            <label class="builder-field builder-checkbox"><input type="checkbox" data-k="required" ${field.required ? 'checked' : ''}/> <span>Required</span></label>
          </div>
          <label class="builder-field field-help"><span>Help text</span><textarea data-k="helpText" rows="2" placeholder="Optional note shown under the field">${escapeHtml(field.helpText)}</textarea></label>
          <div class="field-options ${optionFieldTypes.includes(field.type) ? '' : 'hidden'}" data-options-for="${field.id}">
            <label class="builder-field"><span>Options</span><textarea data-k="options" rows="3" placeholder="One option per line">${escapeHtml((field.options || []).join('\n'))}</textarea></label>
          </div>
        </div>
      </div>
    `;
    }).join('') : '<p class="muted">Add at least one field to start building the form.</p>';

    fieldsWrap.querySelectorAll('.field-editor').forEach(row => {
      const id = row.dataset.id;

      row.querySelector('[data-action="toggle-expand"]').addEventListener('click', (event) => {
        if (event.target.closest('.field-editor-controls')) return;
        expandedFieldId = expandedFieldId === id ? null : id;
        drawFields();
      });

      row.addEventListener('input', (event) => {
        const target = event.target;
        const key = target.dataset.k;
        const field = fieldState.find(item => item.id === id);
        if (!field || !key) return;
        if (key === 'required') {
          field.required = target.checked;
          drawPreview();
          return;
        }
        if (key === 'options') {
          field.options = target.value.split('\n').map(item => item.trim()).filter(Boolean);
          drawPreview();
          return;
        }
        field[key] = target.value;
        if (key === 'type') {
          drawFields();
        }
        drawPreview();
      });

      row.querySelector('[data-k="remove"]').onclick = () => {
        fieldState = fieldState.filter(item => item.id !== id);
        if (expandedFieldId === id) expandedFieldId = null;
        drawFields();
        drawPreview();
      };

      row.querySelector('[data-k="duplicate"]').onclick = () => {
        const index = fieldState.findIndex(item => item.id === id);
        const original = fieldState[index];
        const copy = { ...original, id: genId(), label: original.label ? `${original.label} (copy)` : '' };
        fieldState.splice(index + 1, 0, copy);
        expandedFieldId = copy.id;
        drawFields();
        drawPreview();
      };

      row.querySelector('[data-k="move-up"]').onclick = () => {
        const index = fieldState.findIndex(item => item.id === id);
        if (index <= 0) return;
        [fieldState[index - 1], fieldState[index]] = [fieldState[index], fieldState[index - 1]];
        drawFields();
        drawPreview();
      };

      row.querySelector('[data-k="move-down"]').onclick = () => {
        const index = fieldState.findIndex(item => item.id === id);
        if (index === -1 || index >= fieldState.length - 1) return;
        [fieldState[index + 1], fieldState[index]] = [fieldState[index], fieldState[index + 1]];
        drawFields();
        drawPreview();
      };
    });
  }

  drawFields();
  drawPreview();

  document.getElementById('save-form').onclick = () => {
    const name = document.getElementById('form-name').value.trim();
    const submissionType = document.getElementById('submission-type').value;
    const status = document.getElementById('form-status').value;

    if (!name) return alert('Form name is required');
    if (!fieldState.length) return alert('At least one field required');

    const cleanFields = fieldState
      .map(field => ({
        id: field.id || genId(),
        label: field.label.trim(),
        type: field.type,
        required: Boolean(field.required),
        options: optionFieldTypes.includes(field.type) ? (field.options || []).map(option => option.trim()).filter(Boolean) : [],
        placeholder: field.placeholder.trim(),
        helpText: field.helpText.trim()
      }))
      .filter(field => field.label);

    if (!cleanFields.length) return alert('Each field needs a label');

    const payload = { name, submissionType, status, fields: cleanFields };
    if (editingFormId) {
      formsService.update(editingFormId, payload);
      alert('Form updated');
    } else {
      formsService.create(payload);
      alert('Form created');
    }

    editingFormId = null;
    fieldState = [];
    expandedFieldId = null;
    window.dispatchEvent(new Event('admin:data-changed'));
    render();
  };
}
