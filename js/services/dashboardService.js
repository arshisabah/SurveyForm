import { formsService } from './formsService.js';
import { pollsService } from './pollsService.js';
import { responsesService } from './responsesService.js';

export const dashboardService = {
  compute() {
    const forms = formsService.all();
    const polls = pollsService.all();
    const formResponses = responsesService.allFormResponses();
    const pollVotes = responsesService.allPollVotes();

    const formCountMap = formResponses.reduce((a, r) => ((a[r.formId] = (a[r.formId] || 0) + 1), a), {});
    const pollCountMap = pollVotes.reduce((a, v) => ((a[v.pollId] = (a[v.pollId] || 0) + 1), a), {});

    const mostSubmittedFormId = Object.entries(formCountMap).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const highestVotedPollId = Object.entries(pollCountMap).sort((a,b)=>b[1]-a[1])[0]?.[0];

    return {
      totalForms: forms.length,
      totalPolls: polls.length,
      totalResponses: formResponses.length + pollVotes.length,
      activeCount: forms.filter(f=>f.status==='active').length + polls.filter(p=>p.status==='active').length,
      mostSubmittedForm: forms.find(f=>f.id===mostSubmittedFormId) || null,
      highestVotedPoll: polls.find(p=>p.id===highestVotedPollId) || null
    };
  }
};
