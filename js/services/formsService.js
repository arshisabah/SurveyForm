import { storage } from './storageService.js';
import { genId, nowIso } from '../utils/id.js';

const KEY = 'forms';

export const formsService = {
  all() { return storage.get(KEY, []); },
  saveAll(list) { storage.set(KEY, list); },
  create(form) {
    const list = this.all();
    const item = { ...form, id: genId(), createdAt: nowIso(), updatedAt: nowIso() };
    list.push(item);
    this.saveAll(list);
    return item;
  },
  update(id, patch) {
    const list = this.all().map(f => f.id === id ? { ...f, ...patch, updatedAt: nowIso() } : f);
    this.saveAll(list);
  },
  remove(id) {
    this.saveAll(this.all().filter(f => f.id !== id));
  }
};
