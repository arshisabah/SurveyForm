import { formsService } from '../../services/formsService.js';
import { pollsService } from '../../services/pollsService.js';
import { responsesService } from '../../services/responsesService.js';

const formCountEl = document.getElementById('hero-form-count');
const pollCountEl = document.getElementById('hero-poll-count');
const responseCountEl = document.getElementById('hero-response-count');

if (formCountEl && pollCountEl && responseCountEl) {
  window.addEventListener('admin:data-changed', render);
  render();
}

function render() {
  formCountEl.textContent = formsService.all().length;
  pollCountEl.textContent = pollsService.all().length;
  const totalResponses = responsesService.allFormResponses().length + responsesService.allPollVotes().length;
  responseCountEl.textContent = totalResponses;
}
