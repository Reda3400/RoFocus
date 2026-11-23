import type { Module, StudySession, UserPreferences } from '../types';

export const INITIAL_MODULES: Module[] = [
  {
    id: 'java-1',
    name: 'Java Advanced',
    topic: 'Exception Handling & Concurrency',
    description: 'Mastering robust error management and multi-threaded execution in Java enterprise systems.',
    objectives: [
      'Understand checked vs unchecked exceptions',
      'Implement custom exception hierarchies',
      'Master try-with-resources and AutoCloseable',
      'Explore ExecutorService and ThreadPools',
      'Complete hands-on synchronization exercises'
    ],
    tasks: [
      { id: 't1', title: 'Study checked and unchecked exceptions hierarchy', completed: true, priority: 'high', estimatedMinutes: 25 },
      { id: 't2', title: 'Implement custom exception classes with cause chaining', completed: true, priority: 'medium', estimatedMinutes: 20 },
      { id: 't3', title: 'Practice try-with-resources and AutoCloseable interface', completed: false, priority: 'high', estimatedMinutes: 30 },
      { id: 't4', title: 'Review ExecutorService and Callable/Future patterns', completed: false, priority: 'high', estimatedMinutes: 45 },
      { id: 't5', title: 'Complete concurrency synchronization lab exercises', completed: false, priority: 'medium', estimatedMinutes: 40 }
    ],
    createdAt: new Date().toISOString(),
    color: '#00afb9'
  },
  {
    id: 'ts-1',
    name: 'TypeScript Architectural Patterns',
    topic: 'Advanced Type Systems & Generics',
    description: 'Building bulletproof type-safe architectures with conditional types, mapped types, and inference.',
    objectives: [
      'Master conditional types and infer keyword',
      'Create robust utility types',
      'Understand template literal types',
      'Implement repository pattern in TypeScript'
    ],
    tasks: [
      { id: 'ts1', title: 'Study conditional types and infer keyword deeply', completed: true, priority: 'high', estimatedMinutes: 30 },
      { id: 'ts2', title: 'Build custom utility types for strict API responses', completed: false, priority: 'high', estimatedMinutes: 35 },
      { id: 'ts3', title: 'Implement generic repository pattern interface', completed: false, priority: 'medium', estimatedMinutes: 40 }
    ],
    createdAt: new Date().toISOString(),
    color: '#f07167'
  },
  {
    id: 'net-1',
    name: 'Network Protocols & Security',
    topic: 'TLS 1.3 & Zero Trust Architectures',
    description: 'Deep dive into cryptographic handshakes, certificate chains, and modern secure network design.',
    objectives: [
      'Analyze TLS 1.3 handshake sequence',
      'Understand public key infrastructure (PKI)',
      'Explore zero trust network access (ZTNA) principles'
    ],
    tasks: [
      { id: 'n1', title: 'Trace TLS 1.3 1-RTT handshake packets', completed: false, priority: 'high', estimatedMinutes: 30 },
      { id: 'n2', title: 'Study X.509 certificate validation workflows', completed: false, priority: 'medium', estimatedMinutes: 25 },
      { id: 'n3', title: 'Review mutual TLS (mTLS) implementation guides', completed: false, priority: 'high', estimatedMinutes: 35 }
    ],
    createdAt: new Date().toISOString(),
    color: '#0081a7'
  }
];

export const STORAGE_KEYS = {
  MODULES: 'refocus_modules_v1',
  ACTIVE_SESSION: 'refocus_active_session_v1',
  HISTORY: 'refocus_history_v1',
  PREFERENCES: 'refocus_preferences_v1',
  INTRO_SEEN: 'refocus_intro_seen_v1'
};

export function loadModules(): Module[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MODULES);
    return data ? JSON.parse(data) : INITIAL_MODULES;
  } catch {
    return INITIAL_MODULES;
  }
}

export function saveModules(modules: Module[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  } catch (e) {
    console.error('Failed to save modules', e);
  }
}

export function loadActiveSession(): StudySession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: StudySession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch (e) {
    console.error('Failed to save active session', e);
  }
}

export function loadHistory(): StudySession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : { soundEnabled: true, volume: 0.7, themeColor: '#00afb9' };
  } catch {
    return { soundEnabled: true, volume: 0.7, themeColor: '#00afb9' };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}
