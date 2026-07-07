import { storage } from '../services/storageService.js';
import { genId } from './id.js';

const KEY = 'respondent';

export function getRespondent() {
  let respondent = storage.get(KEY, null);
  if (!respondent || !respondent.id) {
    respondent = { id: genId(), name: '' };
    storage.set(KEY, respondent);
  }
  return respondent;
}

export function setRespondentName(name) {
  const respondent = getRespondent();
  respondent.name = name;
  storage.set(KEY, respondent);
  return respondent;
}
