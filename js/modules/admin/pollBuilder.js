import { POLL_TYPES } from '../../constants/pollTypes.js';
import { STATUS } from '../../constants/status.js';
import { pollsService } from '../../services/pollsService.js';
import { genId } from '../../utils/id.js';

const root = document.getElementById('poll-builder');

let editingPollId = null;
let optionState = [];

if (root) {
  window.addEventListener('admin:edit-poll', (event) => loadForEdit(event.detail?.pollId));
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

function createOption() {
  return { id: genId(), label: '' };
}

function loadForEdit(pollId) {
  const poll = pollsService.all().find(item => item.id === pollId);
  if (!poll) return;
  editingPollId = poll.id;
  optionState = (poll.options || []).map(option => ({ id: option.id || genId(), label: option.label || '' }));
  render(poll);
}

function resetBuilder() {
  editingPollId = null;
  optionState = [];
  render();
}

function render(poll = null) {
  root.innerHTML = `
    <div class="builder-toolbar">
      <div>
        <p class="eyebrow">Poll configuration</p>
        <h3>${editingPollId ? 'Edit poll' : 'New poll'}</h3>
      </div>
      <button id="clear-poll" type="button">${editingPollId ? 'Cancel edit' : 'Reset'}</button>
    </div>
    <div class="builder-top-grid">
      <label class="builder-field">
        <span>Poll question</span>
        <input id="poll-question" placeholder="Which feature should be released next?" value="${escapeHtml(poll?.question || '')}" />
      </label>
      <label class="builder-field">
        <span>Choice type</span>
        <select id="poll-choice-type">
          <option value="${POLL_TYPES.SINGLE}" ${!poll || poll.choiceType === POLL_TYPES.SINGLE ? 'selected' : ''}>Single Choice</option>
          <option value="${POLL_TYPES.MULTIPLE}" ${poll?.choiceType === POLL_TYPES.MULTIPLE ? 'selected' : ''}>Multiple Choice</option>
        </select>
      </label>
      <label class="builder-field">
        <span>Status</span>
        <select id="poll-status">
          <option value="${STATUS.ACTIVE}" ${!poll || poll.status === STATUS.ACTIVE ? 'selected' : ''}>Active</option>
          <option value="${STATUS.INACTIVE}" ${poll?.status === STATUS.INACTIVE ? 'selected' : ''}>Inactive</option>
        </select>
      </label>
    </div>
    <p class="muted builder-note">Add at least two options. The vote type is configurable per poll.</p>
    <div id="poll-options"></div>
    <div class="builder-footer">
      <button id="add-option" type="button">Add option</button>
      <button id="save-poll" type="button" class="btn-primary">${editingPollId ? 'Update poll' : 'Save poll'}</button>
    </div>
  `;

  const optionsWrap = document.getElementById('poll-options');
  document.getElementById('clear-poll').onclick = resetBuilder;
  document.getElementById('add-option').onclick = () => {
    optionState.push(createOption());
    drawOptions();
  };

  function drawOptions() {
    optionsWrap.innerHTML = optionState.length ? optionState.map((option, index) => `
      <div class="field-editor card" data-id="${option.id}">
        <div class="field-editor-head">
          <strong>Option ${index + 1}</strong>
          <button data-k="remove" class="btn-danger" type="button">Delete</button>
        </div>
        <label class="builder-field">
          <span>Label</span>
          <input data-k="label" placeholder="Dark Mode" value="${escapeHtml(option.label)}" />
        </label>
      </div>
    `).join('') : '<p class="muted">Add at least two options to configure the poll.</p>';

    optionsWrap.querySelectorAll('.field-editor').forEach(row => {
      const id = row.dataset.id;
      row.addEventListener('input', (event) => {
        const target = event.target;
        if (target.dataset.k !== 'label') return;
        const option = optionState.find(item => item.id === id);
        if (option) option.label = target.value;
      });
      row.querySelector('[data-k="remove"]').onclick = () => {
        optionState = optionState.filter(item => item.id !== id);
        drawOptions();
      };
    });
  }

  drawOptions();

  document.getElementById('save-poll').onclick = () => {
    const question = document.getElementById('poll-question').value.trim();
    const choiceType = document.getElementById('poll-choice-type').value;
    const status = document.getElementById('poll-status').value;
    const cleanOptions = optionState.map(option => ({ ...option, label: option.label.trim() })).filter(option => option.label);

    if (!question) return alert('Question required');
    if (cleanOptions.length < 2) return alert('At least 2 options required');

    const payload = { question, choiceType, status, options: cleanOptions };
    if (editingPollId) {
      pollsService.update(editingPollId, payload);
      alert('Poll updated');
    } else {
      pollsService.create(payload);
      alert('Poll created');
    }

    editingPollId = null;
    optionState = [];
    window.dispatchEvent(new Event('admin:data-changed'));
    render();
  };
}