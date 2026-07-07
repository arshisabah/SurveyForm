import { storage } from './storageService.js';
import { genId, nowIso } from '../utils/id.js';

const FORM_KEY = 'formResponses';
const VOTE_KEY = 'pollVotes';

export const responsesService = {
  allFormResponses() { return storage.get(FORM_KEY, []); },
  allPollVotes() { return storage.get(VOTE_KEY, []); },
  submitFormResponse(payload) {
    const list = this.allFormResponses();
    list.push({ id: genId(), submittedAt: nowIso(), ...payload });
    storage.set(FORM_KEY, list);
  },
  submitPollVote(payload) {
    const list = this.allPollVotes();
    list.push({ id: genId(), votedAt: nowIso(), ...payload });
    storage.set(VOTE_KEY, list);
  }
};
