import { POLL_TYPES } from '../../constants/pollTypes.js';
import { STATUS } from '../../constants/status.js';
import { pollsService } from '../../services/pollsService.js';
import { genId } from '../../utils/id.js';

const root = document.getElementById('poll-builder');
if (root) render();

function render() {
  root.innerHTML = `
    <div class="row">
      <input id="poll-question" placeholder="Poll question" style="min-width:300px" />
      <select id="poll-choice-type">
        <option value="${POLL_TYPES.SINGLE}">Single Choice</option>
        <option value="${POLL_TYPES.MULTIPLE}">Multiple Choice</option>
      </select>
      <select id="poll-status">
        <option value="${STATUS.ACTIVE}">Active</option>
        <option value="${STATUS.INACTIVE}">Inactive</option>
      </select>
    </div>
    <div id="poll-options"></div>
    <button id="add-option">Add Option</button>
    <button id="save-poll" class="btn-primary">Save Poll</button>
  `;

  const options = [];
  const wrap = document.getElementById('poll-options');

  const draw = () => {
    wrap.innerHTML = options.map(o => `
      <div class="row" data-id="${o.id}">
        <input data-k="label" placeholder="Option label" value="${o.label}" />
        <button data-k="remove" class="btn-danger">X</button>
      </div>
    `).join('');
    wrap.querySelectorAll('[data-id]').forEach(row => {
      const id = row.dataset.id;
      row.querySelector('[data-k="label"]').addEventListener('input', (e) => {
        const option = options.find(x=>x.id===id);
        option.label = e.target.value;
      });
      row.querySelector('[data-k="remove"]').onclick = () => {
        const idx = options.findIndex(x=>x.id===id);
        if (idx>=0) options.splice(idx,1);
        draw();
      };
    });
  };

  document.getElementById('add-option').onclick = () => {
    options.push({ id: genId(), label: '' });
    draw();
  };

  document.getElementById('save-poll').onclick = () => {
    const question = document.getElementById('poll-question').value.trim();
    const choiceType = document.getElementById('poll-choice-type').value;
    const status = document.getElementById('poll-status').value;
    const clean = options.map(o=>({ ...o, label: o.label.trim() })).filter(o=>o.label);
    if (!question) return alert('Question required');
    if (clean.length < 2) return alert('At least 2 options required');
    pollsService.create({ question, choiceType, status, options: clean });
    alert('Poll created');
    location.reload();
  };
}
