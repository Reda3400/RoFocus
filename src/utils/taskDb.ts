import type { Module, Task } from '../types';

export interface TaskRecord extends Task {
  moduleId: string;
}

export interface TaskDatabase {
  version: number;
  tasks: TaskRecord[];
}

const DB_FILE = `${import.meta.env.BASE_URL}tasks.json`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function normalizeTaskDb(value: unknown): TaskDatabase {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.tasks)) {
    throw new Error('Not a RoFocus task database.');
  }

  const tasks: TaskRecord[] = value.tasks.map(raw => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.moduleId !== 'string' || typeof raw.title !== 'string' || typeof raw.completed !== 'boolean') {
      throw new Error('A task is missing its id, moduleId, title or completed state.');
    }
    const priority = raw.priority === 'low' || raw.priority === 'medium' || raw.priority === 'high'
      ? raw.priority
      : undefined;
    const estimatedMinutes = typeof raw.estimatedMinutes === 'number' && Number.isFinite(raw.estimatedMinutes)
      ? raw.estimatedMinutes
      : undefined;
    return {
      id: raw.id,
      moduleId: raw.moduleId,
      title: raw.title,
      completed: raw.completed,
      priority,
      estimatedMinutes,
      description: typeof raw.description === 'string' ? raw.description : undefined
    };
  });

  return { version: 1, tasks };
}

export async function fetchTaskDb(): Promise<TaskDatabase> {
  const response = await fetch(DB_FILE);
  if (!response.ok) throw new Error(`Could not load ${DB_FILE}.`);
  return normalizeTaskDb(await response.json());
}

export function parseTaskDbText(text: string): TaskDatabase {
  return normalizeTaskDb(JSON.parse(text));
}

export function taskDbFromModules(modules: Module[]): TaskDatabase {
  return {
    version: 1,
    tasks: modules.flatMap(mod => mod.tasks.map(task => ({ ...task, moduleId: mod.id })))
  };
}

export function applyTaskDb(modules: Module[], db: TaskDatabase): Module[] {
  return modules.map(mod => ({
    ...mod,
    tasks: db.tasks
      .filter(task => task.moduleId === mod.id)
      .map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes,
        description: task.description
      }))
  }));
}

export function downloadTaskDb(db: TaskDatabase): void {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tasks.json';
  link.click();
  URL.revokeObjectURL(url);
}
