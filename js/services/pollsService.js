import { storage } from './storageService.js';
import { genId, nowIso } from '../utils/id.js';

const KEY = 'polls';

export const pollsService = {
  all() { return storage.get(KEY, []); },
  saveAll(list) { storage.set(KEY, list); },
  create(poll) {
    const list = this.all();
    const item = { ...poll, id: genId(), createdAt: nowIso(), updatedAt: nowIso() };
    list.push(item);
    this.saveAll(list);
    return item;
  },
  update(id, patch) {
    const list = this.all().map(p => p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p);
    this.saveAll(list);
  },
  remove(id) {
    this.saveAll(this.all().filter(p => p.id !== id));
  }
};
