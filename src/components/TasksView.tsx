import React, { useRef, useState } from 'react';
import type { Module, Task } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Filter, Pencil, Download, Upload, RotateCcw } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high';

interface EditState {
  moduleId: string;
  taskId: string;
  title: string;
  priority: Priority;
  minutes: number;
}

interface TasksViewProps {
  modules: Module[];
  onUpdateModule: (module: Module) => void;
  onExportDb: () => void;
  onImportDb: (file: File) => Promise<void>;
  onReloadDb: () => Promise<void>;
}

export const TasksView: React.FC<TasksViewProps> = ({
  modules,
  onUpdateModule,
  onExportDb,
  onImportDb,
  onReloadDb
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [targetModuleId, setTargetModuleId] = useState<string>(modules[0]?.id || '');
  const [dbMessage, setDbMessage] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTasksWithModule = modules.flatMap(mod =>
    mod.tasks.map(task => ({
      ...task,
      moduleId: mod.id,
      moduleName: mod.name,
      moduleColor: '#00afb9'
    }))
  );

  const filteredTasks = allTasksWithModule.filter(t => {
    if (selectedModuleId !== 'all' && t.moduleId !== selectedModuleId) return false;
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    return true;
  });

  const patchTask = (moduleId: string, taskId: string, patch: Partial<Task>) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    onUpdateModule({
      ...mod,
      tasks: mod.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t)
    });
  };

  const deleteTask = (moduleId: string, taskId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    onUpdateModule({ ...mod, tasks: mod.tasks.filter(t => t.id !== taskId) });
    if (editing?.taskId === taskId) setEditing(null);
  };

  const handleGlobalAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !targetModuleId) return;

    const mod = modules.find(m => m.id === targetModuleId);
    if (!mod) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      estimatedMinutes: 25
    };

    onUpdateModule({ ...mod, tasks: [...mod.tasks, newTask] });
    setNewTaskTitle('');
  };

  const startEditing = (moduleId: string, task: Task) => {
    setEditing({
      moduleId,
      taskId: task.id,
      title: task.title,
      priority: task.priority || 'medium',
      minutes: task.estimatedMinutes || 25
    });
  };

  const saveEditing = () => {
    if (!editing || !editing.title.trim()) return;
    patchTask(editing.moduleId, editing.taskId, {
      title: editing.title.trim(),
      priority: editing.priority,
      estimatedMinutes: editing.minutes
    });
    setEditing(null);
  };

  const runDbAction = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      setDbMessage(success);
    } catch {
      setDbMessage('That JSON file could not be read.');
    }
  };

  const totalTasksCount = allTasksWithModule.length;
  const completedTasksCount = allTasksWithModule.filter(t => t.completed).length;

  return (
    <div data-reveal className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0081a7]/10 pb-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-1">
            Actionable Finish Line
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0081a7]">
            Task Management Center
          </h1>
        </div>
        <div className="font-mono text-xs text-[#0081a7]/80 bg-[#fed9b7]/30 px-4 py-2.5 rounded-xl border border-[#fed9b7]">
          Progress: <span className="font-bold text-[#00afb9]">{completedTasksCount} / {totalTasksCount}</span> completed
        </div>
      </div>

      <div className="task-db-bar flex flex-col md:flex-row md:items-center gap-3 bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] flex-1">
          Task database / JSON
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onExportDb} className="db-action">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="db-action">
            <Upload className="w-3.5 h-3.5" /> Load file
          </button>
          <button
            type="button"
            onClick={() => void runDbAction(onReloadDb, 'Reloaded from tasks.json.')}
            className="db-action"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) void runDbAction(() => onImportDb(file), 'Tasks loaded from your file.');
              event.target.value = '';
            }}
          />
        </div>
        {dbMessage && <span className="db-message font-mono text-[10px] w-full">{dbMessage}</span>}
      </div>

      <div className="bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-6">
        <form onSubmit={handleGlobalAddTask} className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Add a new task across your study modules..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="flex-1 w-full px-4 py-3.5 rounded-2xl bg-[#fdfcdc] border border-[#fed9b7] text-[#0081a7] text-xs focus:outline-none focus:border-[#00afb9]"
          />
          <select
            value={targetModuleId}
            onChange={e => setTargetModuleId(e.target.value)}
            className="w-full md:w-auto px-4 py-3.5 rounded-2xl bg-[#fdfcdc] border border-[#fed9b7] text-[#0081a7] text-xs focus:outline-none focus:border-[#00afb9] cursor-pointer"
          >
            {modules.map(mod => (
              <option key={mod.id} value={mod.id}>
                {mod.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#00afb9] text-[#fdfcdc] text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#00afb9]/90 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#fed9b7]/30 p-1.5 rounded-2xl border border-[#fed9b7]">
          {(['all', 'pending', 'completed'] as const).map(value => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === value ? 'bg-[#0081a7] text-[#fdfcdc]' : 'text-[#0081a7] hover:bg-[#fed9b7]/50'
              }`}
            >
              {value === 'all' ? 'All Tasks' : value === 'pending' ? 'Pending' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0081a7]/60" />
          <select
            value={selectedModuleId}
            onChange={e => setSelectedModuleId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[#fed9b7]/20 border border-[#fed9b7] text-[#0081a7] text-xs font-medium focus:outline-none focus:border-[#00afb9] cursor-pointer"
          >
            <option value="all">All Modules</option>
            {modules.map(mod => (
              <option key={mod.id} value={mod.id}>
                {mod.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#fed9b7]/15 border border-[#fed9b7] rounded-3xl p-12 text-center text-[#0081a7]/70 font-mono">
            No tasks match the selected filter.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isEditing = editing?.taskId === task.id && editing.moduleId === task.moduleId;
            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-[#fed9b7]/10 border-[#fed9b7]/50 opacity-75 line-through'
                    : 'bg-[#fed9b7]/20 border-[#fed9b7] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => patchTask(task.moduleId, task.id, { completed: !task.completed })}
                    className="text-[#00afb9] hover:text-[#0081a7] cursor-pointer flex-shrink-0"
                  >
                    {task.completed
                      ? <CheckCircle2 className="w-6 h-6 text-[#00afb9]" />
                      : <Circle className="w-6 h-6 text-[#0081a7]/40" />}
                  </button>

                  {isEditing ? (
                    <div className="flex flex-col md:flex-row gap-2 w-full">
                      <input
                        value={editing.title}
                        onChange={e => setEditing({ ...editing, title: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#fdfcdc] border border-[#fed9b7] text-xs"
                        aria-label="Task title"
                      />
                      <select
                        value={editing.priority}
                        onChange={e => setEditing({ ...editing, priority: e.target.value as Priority })}
                        className="px-3 py-2 rounded-xl bg-[#fdfcdc] border border-[#fed9b7] text-xs cursor-pointer"
                        aria-label="Task priority"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={editing.minutes}
                        onChange={e => setEditing({ ...editing, minutes: Number(e.target.value) })}
                        className="w-20 px-3 py-2 rounded-xl bg-[#fdfcdc] border border-[#fed9b7] text-xs"
                        aria-label="Estimated minutes"
                      />
                      <button type="button" onClick={saveEditing} className="db-action">Save</button>
                      <button type="button" onClick={() => setEditing(null)} className="db-action">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className={`text-xs md:text-sm font-semibold break-words ${task.completed ? 'text-[#0081a7]/60' : 'text-[#0081a7]'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00afb9]"></span>
                        <span className="font-mono text-[11px] text-[#0081a7]/70">
                          {task.moduleName} · {task.priority || 'medium'} · {task.estimatedMinutes || 25} min
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(task.moduleId, task)}
                      className="text-[#0081a7]/50 hover:text-[#0081a7] p-2 transition-colors cursor-pointer"
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.moduleId, task.id)}
                      className="delete-action delete-task"
                      title="Delete task"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
