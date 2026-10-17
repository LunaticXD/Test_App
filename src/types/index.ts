export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type AppSource = 'manual' | 'drop_window' | 'vscode' | 'claude' | 'git' | 'gmail' | 'classroom';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  tags: string[];
  subtasks: Subtask[];
  source?: AppSource;
  sourceDetails?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  estimatedMinutes?: number;
  aiReasoning?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface AppConnectorConfig {
  id: AppSource;
  name: string;
  description: string;
  iconName: string;
  connected: boolean;
  lastSynced?: number;
  autoSync: boolean;
  syncIntervalMin: number;
  authType: 'oauth' | 'token' | 'local_extension';
  details: string;
}

export interface DesktopFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  fileObj?: File;
}

export interface OrganizedFileResult {
  id: string;
  originalName: string;
  size: number;
  lastModified: number;
  destinationFolder: string;
  suggestedName: string;
  category: string;
  reason: string;
}

export interface DestinationFolderConfig {
  id: string;
  name: string;
  path: string;
  icon?: string;
  color: string;
  description?: string;
}

export type FileSortRule = 'custom_folders' | 'type_and_date' | 'type' | 'date' | 'smart_ai';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: number;
  pendingChangesCount: number;
  cloudDeviceCount: number;
}

export type ThemeMode = 'cyberpunk' | 'matrix' | 'synthwave' | 'obsidian' | 'solar';
