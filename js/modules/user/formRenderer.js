import { formsService } from '../../services/formsService.js';
import { responsesService } from '../../services/responsesService.js';
import { validateForm } from '../../utils/validator.js';
import { getRespondent, setRespondentName } from '../../utils/identity.js';

const root = document.getElementById('form-renderer');
if (root) {
  root.innerHTML = '<p class="muted">Select a form to fill.</p>';
  window.addEventListener('form:selected', (e) => renderForm(e.detail.formId));
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderForm(formId) {
  const form = formsService.all().find(f => f.id === formId);
  if (!form) return;
  if (form.status !== 'active') return root.innerHTML = '<p class="muted">This form is inactive.</p>';

  const respondent = getRespondent();
  const responses = responsesService.allFormResponses();
  const already = responses.some(r => r.formId === form.id && r.userId === respondent.id);
  if (form.submissionType === 'single' && already) {
    root.innerHTML = '<p class="muted">You already submitted this form (single submission).</p>';
    return;
  }

  root.innerHTML = `
    <h3>${escapeHtml(form.name)}</h3>
    <label class="row"><span>Your name (shown to the admin)</span></label>
    <div class="row">
      <input id="respondent-name" placeholder="e.g. Priya Sharma" value="${escapeHtml(respondent.name || '')}" />
    </div>
    <form id="dynamic-form"></form>
    <button id="submit-dynamic-form" class="btn-primary">Submit</button>
  `;

  const formEl = document.getElementById('dynamic-form');
  form.fields.forEach(field => {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    const label = `<label>${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>`;
    let input = '';
    const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
    if (['text', 'number', 'date'].includes(field.type)) input = `<input type="${field.type}" name="${field.id}"${placeholder} />`;
    if (field.type === 'textarea') input = `<textarea name="${field.id}"${placeholder}></textarea>`;
    if (field.type === 'dropdown') input = `<select name="${field.id}"><option value="">Select</option>${(field.options || []).map(o => `<option>${escapeHtml(o)}</option>`).join('')}</select>`;
    if (field.type === 'radio') input = (field.options || []).map(o => `<label><input type="radio" name="${field.id}" value="${escapeHtml(o)}" /> ${escapeHtml(o)}</label>`).join('');
    if (field.type === 'checkbox') input = (field.options || []).map(o => `<label><input type="checkbox" name="${field.id}" value="${escapeHtml(o)}" /> ${escapeHtml(o)}</label>`).join('');
    wrap.innerHTML = `${label}${field.helpText ? `<div class="small">${escapeHtml(field.helpText)}</div>` : ''}${input}`;
    formEl.appendChild(wrap);
  });

  document.getElementById('submit-dynamic-form').onclick = () => {
    const answers = {};
    form.fields.forEach(field => {
      if (field.type === 'checkbox') {
        answers[field.id] = [...formEl.querySelectorAll(`input[name="${field.id}"]:checked`)].map(el => el.value);
      } else if (field.type === 'radio') {
        answers[field.id] = formEl.querySelector(`input[name="${field.id}"]:checked`)?.value || '';
      } else {
        answers[field.id] = formEl.querySelector(`[name="${field.id}"]`)?.value ?? '';
      }
    });
    const errors = validateForm(form, answers);
    if (Object.keys(errors).length) return alert(Object.values(errors).join('\n'));

    const nameValue = document.getElementById('respondent-name').value.trim();
    setRespondentName(nameValue);

    responsesService.submitFormResponse({ formId: form.id, userId: respondent.id, userName: nameValue, answers });
    alert('Form submitted');
    renderForm(form.id);
  };
}
