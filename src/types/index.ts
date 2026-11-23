export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  estimatedMinutes?: number;
}

export interface Module {
  id: string;
  name: string;
  topic: string;
  description?: string;
  objectives?: string[];
  tasks: Task[];
  createdAt: string;
  color?: string;
}

export interface StudySession {
  id: string;
  moduleId: string;
  moduleName: string;
  topic: string;
  plannedMinutes: number;
  elapsedSeconds: number;
  overtimeSeconds: number;
  status: 'idle' | 'running' | 'paused' | 'overtime' | 'completed';
  startTime?: string;
  endTime?: string;
  tasksCompleted: number;
  totalTasks: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  volume: number;
  themeColor: string;
}
