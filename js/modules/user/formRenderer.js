import { formsService } from '../../services/formsService.js';
import { responsesService } from '../../services/responsesService.js';
import { validateForm } from '../../utils/validator.js';

const USER_ID = 'demo-user';
const root = document.getElementById('form-renderer');
if (root) {
  root.innerHTML = '<p class="muted">Select a form to fill.</p>';
  window.addEventListener('form:selected', (e) => renderForm(e.detail.formId));
}

function renderForm(formId) {
  const form = formsService.all().find(f=>f.id===formId);
  if (!form) return;
  if (form.status !== 'active') return root.innerHTML = '<p class="muted">This form is inactive.</p>';

  const responses = responsesService.allFormResponses();
  const already = responses.some(r => r.formId === form.id && r.userId === USER_ID);
  if (form.submissionType === 'single' && already) {
    root.innerHTML = '<p class="muted">You already submitted this form (single submission).</p>';
    return;
  }

  root.innerHTML = `
    <h3>${form.name}</h3>
    <form id="dynamic-form"></form>
    <button id="submit-dynamic-form" class="btn-primary">Submit</button>
  `;

  const formEl = document.getElementById('dynamic-form');
  form.fields.forEach(field => {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    const label = `<label>${field.label}${field.required ? ' *' : ''}</label>`;
    let input = '';
    if (['text','number','date'].includes(field.type)) input = `<input type="${field.type}" name="${field.id}" />`;
    if (field.type === 'textarea') input = `<textarea name="${field.id}"></textarea>`;
    if (field.type === 'dropdown') input = `<select name="${field.id}"><option value="">Select</option>${(field.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`;
    if (field.type === 'radio') input = (field.options||[]).map(o=>`<label><input type="radio" name="${field.id}" value="${o}" /> ${o}</label>`).join('');
    if (field.type === 'checkbox') input = (field.options||[]).map(o=>`<label><input type="checkbox" name="${field.id}" value="${o}" /> ${o}</label>`).join('');
    wrap.innerHTML = `${label} ${input}`;
    formEl.appendChild(wrap);
  });

  document.getElementById('submit-dynamic-form').onclick = () => {
    const answers = {};
    form.fields.forEach(field => {
      if (field.type === 'checkbox') {
        answers[field.id] = [...formEl.querySelectorAll(`input[name="${field.id}"]:checked`)].map(el=>el.value);
      } else if (field.type === 'radio') {
        answers[field.id] = formEl.querySelector(`input[name="${field.id}"]:checked`)?.value || '';
      } else {
        answers[field.id] = formEl.querySelector(`[name="${field.id}"]`)?.value ?? '';
      }
    });
    const errors = validateForm(form, answers);
    if (Object.keys(errors).length) return alert(Object.values(errors).join('\n'));
    responsesService.submitFormResponse({ formId: form.id, userId: USER_ID, answers });
    alert('Form submitted');
    renderForm(form.id);
  };
}
