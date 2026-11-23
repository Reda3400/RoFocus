import { readFileSync } from 'node:fs';

const file = new URL('../public/tasks.json', import.meta.url);
const db = JSON.parse(readFileSync(file, 'utf8'));

if (db.version !== 1 || !Array.isArray(db.tasks) || db.tasks.length === 0) {
  throw new Error('tasks.json must be version 1 with at least one task.');
}

for (const task of db.tasks) {
  if (typeof task.id !== 'string' || typeof task.moduleId !== 'string' || typeof task.title !== 'string' || typeof task.completed !== 'boolean') {
    throw new Error(`Invalid task in tasks.json: ${JSON.stringify(task)}`);
  }
}

console.log(`tasks.json OK — ${db.tasks.length} tasks`);
