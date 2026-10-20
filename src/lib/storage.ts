import { Task, SyncState, AppConnectorConfig, ThemeMode } from '../types';
import { THEME_ORDER, isThemeMode } from './theme';

const STORAGE_KEYS = {
  TASKS: 'taskorbit_tasks_v1',
  PENDING_CHANGES: 'taskorbit_pending_changes_v1',
  LAST_SYNC: 'taskorbit_last_sync_v1',
  CONNECTORS: 'taskorbit_connectors_v1',
  THEME: 'taskorbit_theme_v1',
  DEVICE_ID: 'taskorbit_device_id_v1',
  PROJECTS: 'taskorbit_projects_v1',
};

export const DEFAULT_PROJECTS = [
  { id: 'Frontend', name: 'Frontend', color: 'indigo' },
  { id: 'Backend & API', name: 'Backend & API', color: 'emerald' },
  { id: 'DevOps & Git', name: 'DevOps & Git', color: 'amber' },
  { id: 'Classroom / Study', name: 'Classroom / Study', color: 'purple' },
  { id: 'Client & Mail', name: 'Client & Mail', color: 'rose' },
  { id: 'Personal', name: 'Personal', color: 'sky' },
];

export const DEFAULT_CONNECTORS: AppConnectorConfig[] = [
  {
    id: 'vscode',
    name: 'VS Code Extension',
    description: 'Scans workspace for // TODO: and // FIXME: comments and active git branch tasks',
    iconName: 'Code',
    connected: true,
    lastSynced: Date.now() - 1000 * 60 * 15,
    autoSync: true,
    syncIntervalMin: 15,
    authType: 'local_extension',
    details: 'Workspace: /Users/developer/projects/taskorbit (Port 4242)',
  },
  {
    id: 'claude',
    name: 'Claude Desktop & Web',
    description: 'Auto-extracts actionable checklists and task summaries from AI conversations',
    iconName: 'Bot',
    connected: true,
    lastSynced: Date.now() - 1000 * 60 * 45,
    autoSync: true,
    syncIntervalMin: 30,
    authType: 'token',
    details: 'Claude API Webhook Token: active (last export: Rate Limiter Design)',
  },
  {
    id: 'git',
    name: 'Git (GitHub & GitLab)',
    description: 'Syncs assigned pull requests, review requests, and issue milestones',
    iconName: 'GitPullRequest',
    connected: true,
    lastSynced: Date.now() - 1000 * 60 * 60,
    autoSync: true,
    syncIntervalMin: 60,
    authType: 'oauth',
    details: 'Authenticated as @octo-developer (3 repositories tracked)',
  },
  {
    id: 'gmail',
    name: 'Gmail Workspace',
    description: 'Converts flagged & action-required emails directly into scheduled tasks',
    iconName: 'Mail',
    connected: true,
    lastSynced: Date.now() - 1000 * 60 * 25,
    autoSync: true,
    syncIntervalMin: 15,
    authType: 'oauth',
    details: 'findadvait@gmail.com (Filter: label:action-required)',
  },
  {
    id: 'classroom',
    name: 'Google Classroom',
    description: 'Pulls coursework, homework assignments, deadlines, and grade notifications',
    iconName: 'GraduationCap',
    connected: true,
    lastSynced: Date.now() - 1000 * 60 * 120,
    autoSync: true,
    syncIntervalMin: 120,
    authType: 'oauth',
    details: 'Courses: CS 448 Distributed Systems, Advanced Algorithms',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review PR #142: Add offline IndexedDB caching layer',
    description: 'Verify sync queue rollback when device loses network connectivity mid-sync. Review diff in GitHub connector.',
    project: 'Frontend',
    priority: 'High',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: ['git', 'offline', 'storage'],
    subtasks: [
      { id: 'st-1', title: 'Test IndexedDB downgrade recovery', completed: true },
      { id: 'st-2', title: 'Verify optimistic UI updates', completed: false },
      { id: 'st-3', title: 'Approve PR or request changes', completed: false },
    ],
    source: 'git',
    sourceDetails: 'GitHub: org/taskorbit-core #142',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
    estimatedMinutes: 45,
    aiReasoning: 'Inferred High priority from reviewer deadline on GitHub PR',
  },
  {
    id: 't-2',
    title: 'Distributed Systems: Lab 3 Raft Consensus Implementation',
    description: 'Submit leader election test suite and 2A passing benchmark logs to Google Classroom.',
    project: 'Classroom / Study',
    priority: 'Urgent',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    tags: ['classroom', 'assignment', 'cs448'],
    subtasks: [
      { id: 'st-4', title: 'Leader election RPC timers', completed: true },
      { id: 'st-5', title: 'Log entry match index checks', completed: false },
      { id: 'st-6', title: 'Compile PDF report for professor', completed: false },
    ],
    source: 'classroom',
    sourceDetails: 'CS 448 Fall 2026 - Due in 3 days',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000 * 2,
    estimatedMinutes: 120,
    aiReasoning: 'Categorized as Urgent based on 3-day hard assignment deadline from Classroom',
  },
  {
    id: 't-3',
    title: 'Reply to Sarah: Enterprise cloud SLA contract agreement',
    description: 'Signed amendment required by tomorrow 5pm for cloud infrastructure extension.',
    project: 'Client & Mail',
    priority: 'Urgent',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: ['gmail', 'contract', 'urgent'],
    subtasks: [
      { id: 'st-7', title: 'Check Exhibit B pricing table', completed: false },
      { id: 'st-8', title: 'Send DocuSign confirmation link', completed: false },
    ],
    source: 'gmail',
    sourceDetails: 'Thread from sarah.miller@enterprise.io',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    estimatedMinutes: 20,
    aiReasoning: 'Flagged Urgent from email subject "URGENT: Amendment signed by 5pm"',
  },
  {
    id: 't-4',
    title: 'Fix socket memory leak in connection pool',
    description: 'TODO found in src/network/socket_pool.ts:42 by VS Code background analyzer.',
    project: 'Backend & API',
    priority: 'High',
    status: 'todo',
    tags: ['vscode', 'todo', 'bugfix'],
    subtasks: [
      { id: 'st-9', title: 'Unsubscribe event listeners in useEffect', completed: true },
      { id: 'st-10', title: 'Verify heap allocation with Chrome DevTools', completed: false },
    ],
    source: 'vscode',
    sourceDetails: 'VS Code: socket_pool.ts:42',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000,
    estimatedMinutes: 60,
    aiReasoning: 'Parsed as High priority bug directly from VS Code workspace scanner',
  },
  {
    id: 't-5',
    title: 'Implement token bucket rate limiter for API gateway',
    description: 'Action item extracted from Claude architecture discussion on endpoint security.',
    project: 'Backend & API',
    priority: 'Medium',
    status: 'completed',
    tags: ['claude', 'architecture', 'security'],
    subtasks: [
      { id: 'st-11', title: 'Write token replenish algorithm', completed: true },
      { id: 'st-12', title: 'Add Redis key expiry tests', completed: true },
    ],
    source: 'claude',
    sourceDetails: 'Claude Chat: Rate Limiter Design',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 8,
    completedAt: Date.now() - 3600000 * 8,
    estimatedMinutes: 90,
  },
  {
    id: 't-6',
    title: 'Configure system-wide dark mode for connected apps',
    description: 'Export dark theme configuration to VS Code settings, Claude CSS, and OS preferences.',
    project: 'Frontend',
    priority: 'Low',
    status: 'completed',
    tags: ['theme', 'darkmode', 'ux'],
    subtasks: [
      { id: 'st-13', title: 'Add OLED black preset', completed: true },
      { id: 'st-14', title: 'Test contrast ratios with WCAG AAA', completed: true },
    ],
    source: 'manual',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    completedAt: Date.now() - 86400000 * 2,
    estimatedMinutes: 30,
  },
];

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = `device-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    // Guard against corrupted / hand-edited storage that would crash the UI
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch (err) {
    console.error('Error loading tasks from storage:', err);
    return INITIAL_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to storage:', err);
  }
}

export function loadConnectors(): AppConnectorConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONNECTORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONNECTORS, JSON.stringify(DEFAULT_CONNECTORS));
      return DEFAULT_CONNECTORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CONNECTORS;
  } catch {
    return DEFAULT_CONNECTORS;
  }
}

export function saveConnectors(connectors: AppConnectorConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONNECTORS, JSON.stringify(connectors));
  } catch (err) {
    console.error('Error saving connectors:', err);
  }
}

export function loadTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return isThemeMode(stored) ? stored : 'cyberpunk';
  } catch {
    return 'cyberpunk';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyThemeToDOM(theme);
  } catch (err) {
    console.error('Error saving theme:', err);
  }
}

export function applyThemeToDOM(theme: ThemeMode): void {
  const root = document.documentElement;
  THEME_ORDER.forEach((t) => root.classList.remove(`theme-${t}`));

  root.classList.add(`theme-${theme}`);

  // Every component is authored dark-first, so `.dark` stays on for all themes.
  // The light "solar" theme is produced by an inversion filter in index.css.
  // (Native controls stay `color-scheme: dark` for the same reason: the filter flips them to light.)
  root.classList.add('dark');
}

export async function syncWithCloudStorage(
  currentTasks: Task[]
): Promise<{ success: boolean; syncedTasks: Task[]; message: string }> {
  try {
    const res = await fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: currentTasks,
        clientLastSync: Date.now(),
        deviceName: `CyberSpace Desktop (${getDeviceId()})`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Sync failed with status: ${res.status}`);
    }

    const data = await res.json();
    const serverTasks: Task[] = data.serverTasks || currentTasks;

    // Save merged tasks
    saveTasksToStorage(serverTasks);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(data.syncedAt || Date.now()));

    return {
      success: true,
      syncedTasks: serverTasks,
      message: data.message || 'Synced successfully with cloud storage vault',
    };
  } catch (err: any) {
    console.warn('Cloud sync offline or error:', err?.message);
    return {
      success: false,
      syncedTasks: currentTasks,
      message: 'Running offline. Changes cached in local IndexedDB/Storage.',
    };
  }
}
