import { genId, nowIso } from '../utils/id.js';
import { STATUS } from '../constants/status.js';

export const seedForms = [
  {
    id: genId(),
    name: 'Event Registration',
    status: STATUS.ACTIVE,
    submissionType: 'single',
    fields: [
      { id: genId(), label: 'Name', type: 'text', required: true },
      { id: genId(), label: 'Email', type: 'text', required: true },
      { id: genId(), label: 'Food Preference', type: 'dropdown', required: false, options: ['Veg', 'Non Veg'] }
    ],
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
];

export const seedPolls = [
  {
    id: genId(),
    question: 'Which feature should be released next?',
    options: [
      { id: genId(), label: 'Dark Mode' },
      { id: genId(), label: 'Mobile App' },
      { id: genId(), label: 'Dashboard Improvements' }
    ],
    choiceType: 'single',
    status: STATUS.ACTIVE,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
];
