import { dashboardService } from '../../services/dashboardService.js';

const root = document.getElementById('dashboard-stats');
const insights = document.getElementById('top-insights');
if (root && insights) render();

function render() {
  const d = dashboardService.compute();
  root.innerHTML = `
    <div class="card stat"><div class="small">Total Forms</div><h3>${d.totalForms}</h3></div>
    <div class="card stat"><div class="small">Total Polls</div><h3>${d.totalPolls}</h3></div>
    <div class="card stat"><div class="small">Total Responses</div><h3>${d.totalResponses}</h3></div>
    <div class="card stat"><div class="small">Active Forms/Polls</div><h3>${d.activeCount}</h3></div>
  `;

  insights.innerHTML = `
    <h2>Insights</h2>
    <p><strong>Most Submitted Form:</strong> ${d.mostSubmittedForm?.name || 'N/A'}</p>
    <p><strong>Highest Voted Poll:</strong> ${d.highestVotedPoll?.question || 'N/A'}</p>
  `;
}
