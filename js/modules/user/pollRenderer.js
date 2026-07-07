import { pollsService } from '../../services/pollsService.js';
import { responsesService } from '../../services/responsesService.js';
import { toPct } from '../../utils/percentage.js';

const USER_ID = 'demo-user';
const root = document.getElementById('poll-renderer');
const resultsRoot = document.getElementById('poll-results');
if (root && resultsRoot) {
  root.innerHTML = '<p class="muted">Select a poll to vote.</p>';
  window.addEventListener('poll:selected', (e) => renderPoll(e.detail.pollId));
}

function renderPoll(pollId) {
  const poll = pollsService.all().find(p=>p.id===pollId);
  if (!poll) return;
  if (poll.status !== 'active') return root.innerHTML = '<p class="muted">This poll is inactive.</p>';

  root.innerHTML = `
    <h3>${poll.question}</h3>
    <div id="poll-options-wrap"></div>
    <button id="vote-btn" class="btn-primary">Submit Vote</button>
  `;

  const wrap = document.getElementById('poll-options-wrap');
  const inputType = poll.choiceType === 'single' ? 'radio' : 'checkbox';
  wrap.innerHTML = poll.options.map(o => `
    <label><input type="${inputType}" name="poll-option" value="${o.id}" /> ${o.label}</label><br/>
  `).join('');

  document.getElementById('vote-btn').onclick = () => {
    const selected = [...wrap.querySelectorAll('input[name="poll-option"]:checked')].map(el=>el.value);
    if (!selected.length) return alert('Select at least one option');
    responsesService.submitPollVote({ pollId: poll.id, userId: USER_ID, selectedOptionIds: selected });
    alert('Vote submitted');
    renderResults(poll.id);
  };

  renderResults(poll.id);
}

function renderResults(pollId) {
  const poll = pollsService.all().find(p=>p.id===pollId);
  const votes = responsesService.allPollVotes().filter(v=>v.pollId===pollId);
  const total = votes.length;
  const countMap = {};
  votes.forEach(v => v.selectedOptionIds.forEach(id => countMap[id] = (countMap[id] || 0) + 1));

  resultsRoot.innerHTML = `
    <h4>Results</h4>
    <p>Total votes: <strong>${total}</strong></p>
    ${poll.options.map(o => {
      const c = countMap[o.id] || 0;
      const p = toPct(c, total);
      return `<div>${o.label}: ${c} votes (${p}%)</div>`;
    }).join('')}
  `;
}
