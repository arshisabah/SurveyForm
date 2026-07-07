import { seedForms, seedPolls } from '../data/seedData.js';
import { storage } from '../services/storageService.js';

export function bootstrapStore() {
  const forms = storage.get('forms', null);
  const polls = storage.get('polls', null);
  if (!forms) storage.set('forms', seedForms);
  if (!polls) storage.set('polls', seedPolls);
  if (!storage.get('formResponses', null)) storage.set('formResponses', []);
  if (!storage.get('pollVotes', null)) storage.set('pollVotes', []);
}
