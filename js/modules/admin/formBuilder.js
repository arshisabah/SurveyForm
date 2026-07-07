import { FIELD_TYPES } from '../../constants/fieldTypes.js';
import { SUBMISSION_TYPES } from '../../constants/submissionTypes.js';
import { STATUS } from '../../constants/status.js';
import { formsService } from '../../services/formsService.js';
import { genId } from '../../utils/id.js';

const root = document.getElementById('form-builder');
if (root) render();

function render() {
  root.innerHTML = `
    <div class="row">
      <input id="form-name" placeholder="Form Name" />
      <select id="submission-type">
        <option value="${SUBMISSION_TYPES.SINGLE}">Single Submission</option>
        <option value="${SUBMISSION_TYPES.MULTIPLE}">Multiple Submission</option>
      </select>
      <select id="form-status">
        <option value="${STATUS.ACTIVE}">Active</option>
        <option value="${STATUS.INACTIVE}">Inactive</option>
      </select>
    </div>
    <div id="fields-wrap"></div>
    <button id="add-field">Add Field</button>
    <button id="save-form" class="btn-primary">Save Form</button>
  `;

  const fields = [];
  const fieldsWrap = document.getElementById('fields-wrap');

  document.getElementById('add-field').onclick = () => {
    const id = genId();
    fields.push({ id, label:'', type: FIELD_TYPES.TEXT, required:false, options: [] });
    drawFields();
  };

  const drawFields = () => {
    fieldsWrap.innerHTML = fields.map((f, i) => `
      <div class="field-row builder-grid" data-id="${f.id}">
        <input data-k="label" placeholder="Label" value="${f.label}" />
        <select data-k="type">
          ${Object.values(FIELD_TYPES).map(t=>`<option value="${t}" ${f.type===t?'selected':''}>${t}</option>`).join('')}
        </select>
        <label><input type="checkbox" data-k="required" ${f.required?'checked':''}/> Required</label>
        <input data-k="options" placeholder="Options comma-separated" value="${(f.options||[]).join(',')}" />
        <button data-k="remove" class="btn-danger">X</button>
      </div>
    `).join('');

    fieldsWrap.querySelectorAll('.field-row').forEach(row => {
      const id = row.dataset.id;
      row.addEventListener('input', (e) => {
        const target = e.target;
        const k = target.dataset.k;
        const field = fields.find(x=>x.id===id);
        if (!field || !k) return;
        if (k==='required') field.required = target.checked;
        else if (k==='options') field.options = target.value.split(',').map(s=>s.trim()).filter(Boolean);
        else field[k] = target.value;
      });
      row.querySelector('[data-k="remove"]').onclick = () => {
        const idx = fields.findIndex(x=>x.id===id);
        if (idx>=0) fields.splice(idx,1);
        drawFields();
      };
    });
  };

  document.getElementById('save-form').onclick = () => {
    const name = document.getElementById('form-name').value.trim();
    const submissionType = document.getElementById('submission-type').value;
    const status = document.getElementById('form-status').value;
    if (!name) return alert('Form name is required');
    if (!fields.length) return alert('At least one field required');
    formsService.create({ name, submissionType, status, fields });
    alert('Form created');
    location.reload();
  };
}
