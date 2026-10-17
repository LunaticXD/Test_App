import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  BatteryCharging,
  RotateCcw,
  Sparkles,
  Layers,
  Code,
  Bot,
  GitPullRequest,
  Mail,
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  FolderTree,
  Send,
  Move,
  Check,
  Copy,
  Moon,
  Sun,
  Laptop,
  Play,
  Pause,
  Upload,
  Disc,
  Radio,
  Music,
} from 'lucide-react';
import {
  Task,
  TaskStatus,
  SyncState,
  ThemeMode,
  AppConnectorConfig,
} from './types';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadConnectors,
  saveConnectors,
  loadTheme,
  saveTheme,
  applyThemeToDOM,
  syncWithCloudStorage,
} from './lib/storage';
import { soundFX } from './lib/audio';
import { triggerTaskCompletionEffect } from './lib/celebrate';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveFeature } from './components/Sidebar';
import { TaskTrackerView } from './components/TaskTrackerView';
import { KanbanBoard } from './components/KanbanBoard';
import { AnalyticsView } from './components/AnalyticsView';
import { DesktopFileOrganizer } from './components/DesktopFileOrganizer';
import { HoverSortingWindow } from './components/HoverSortingWindow';
import { ThemeShowcase } from './components/ThemeShowcase';
import { TaskModal } from './components/TaskModal';
import { AppConnectorsModal } from './components/AppConnectorsModal';
import { ThemeSyncModal } from './components/ThemeSyncModal';
import { OpeningIntro } from './components/OpeningIntro';
import { CyberMusicPlayerModal } from './components/CyberMusicPlayerModal';

export default function App() {
  // State: Tasks, Connectors, Theme
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [connectors, setConnectors] = useState<AppConnectorConfig[]>(() => loadConnectors());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile_preview'>('desktop');
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('tasks');
  const [isMuted, setIsMuted] = useState(false);
  const [showOpeningIntro, setShowOpeningIntro] = useState(false);

  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Music Player State & Ref
  const [isMusicPlayerModalOpen, setIsMusicPlayerModalOpen] = useState(false);
  const [activeTrackName, setActiveTrackName] = useState(soundFX.currentTrack.title);
  const [isPlayingAudio, setIsPlayingAudio] = useState(soundFX.isAudioElementPlaying || soundFX.isSynthPlaying);
  const quickAudioInputRef = useRef<HTMLInputElement | null>(null);

  // Modals & Floating Window
  const [isHoverWindowOpen, setIsHoverWindowOpen] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isConnectorsModalOpen, setIsConnectorsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Sync State
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: Date.now(),
    pendingChangesCount: 0,
    cloudDeviceCount: 3,
  });

  const availableDestinationFolders = [
    'Legal & Contracts',
    'Media & Screenshots',
    'Code & Scripts',
    'Data & Spreadsheets',
    'Classroom / Study',
    'Archives & Backups',
  ];

  // Initialize theme on mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setSyncState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Audio Engine Subscription
  useEffect(() => {
    const unsubscribe = soundFX.subscribe((state) => {
      setActiveTrackName(state.track.title);
      setIsPlayingAudio(state.isPlaying);
      setIsMuted(state.isMuted);
    });
    return () => unsubscribe();
  }, []);

  const handleQuickAudioUpload = async (file: File) => {
    if (!file) return;
    soundFX.playSweep();
    try {
      await soundFX.loadCustomAudioFile(file);
      setActiveTrackName(file.name);
      setIsPlayingAudio(true);
    } catch (err) {
      console.error('Quick audio upload error:', err);
    }
  };

  // Keyboard Shortcuts: H for Hover Window, N for New Task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsHoverWindowOpen((prev) => !prev);
      }
      if (e.key === 'n' || e.key === 'N') {
        setEditingTask(null);
        setIsTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derived existing projects list
  const existingProjects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.project));
    return Array.from(set);
  }, [tasks]);

  // Task statistics
  const tasksCount = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total, todo, inProgress, completed };
  }, [tasks]);

  // Handlers
  const handleToggleTaskStatus = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
          if (nextStatus === 'completed') {
            soundFX.playSuccess();
            triggerTaskCompletionEffect();
          } else {
            soundFX.playBlip();
          }
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? Date.now() : undefined,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleSaveTask = (taskToSave: Task) => {
    soundFX.playSuccess();
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === taskToSave.id);
      const updated = exists
        ? prev.map((t) => (t.id === taskToSave.id ? taskToSave : t))
        : [taskToSave, ...prev];
      saveTasksToStorage(updated);
      return updated;
    });
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    soundFX.playBlip();
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    soundFX.playBlip();
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: nextSubtasks, updatedAt: Date.now() };
        }
        return t;
      });
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleMoveTaskInKanban = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      soundFX.playSuccess();
      triggerTaskCompletionEffect();
    } else {
      soundFX.playBlip();
    }
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? Date.now() : undefined,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleNewTaskInColumn = (status: TaskStatus) => {
    soundFX.playBlip();
    setEditingTask({
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      project: existingProjects[0] || 'Frontend',
      priority: 'Medium',
      status,
      tags: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsTaskModalOpen(true);
  };

  const handleTaskCreatedFromHoverWindow = (newTask: Task) => {
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleImportTasksFromConnectors = (newTasks: Task[]) => {
    soundFX.playSuccess();
    triggerTaskCompletionEffect();
    setTasks((prev) => {
      const updated = [...newTasks, ...prev];
      saveTasksToStorage(updated);
      return updated;
    });
  };

  const handleUpdateConnectors = (updated: AppConnectorConfig[]) => {
    setConnectors(updated);
    saveConnectors(updated);
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    soundFX.playBlip();
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  const handleManualSync = async () => {
    soundFX.playBlip();
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    const result = await syncWithCloudStorage(tasks);
    if (result.success) {
      soundFX.playSuccess();
      setTasks(result.syncedTasks);
    }
    setSyncState((prev) => ({
      ...prev,
      isSyncing: false,
      lastSyncedAt: Date.now(),
    }));
  };

  // Render the selected main feature view
  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'tasks':
        return (
          <TaskTrackerView
            tasks={tasks}
            onToggleStatus={handleToggleTaskStatus}
            onEditTask={(t) => {
              soundFX.playBlip();
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onOpenNewTaskModal={() => {
              soundFX.playBlip();
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenHoverWindow={() => {
              soundFX.playBlip();
              setIsHoverWindowOpen(true);
            }}
            existingProjects={existingProjects}
          />
        );

      case 'kanban':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>Kanban Flow Matrix</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    DRAG & DROP
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Drag tasks between columns or use quick status advance controls
                </p>
              </div>
              <button
                onClick={() => handleNewTaskInColumn('todo')}
                className="px-3 py-1.5 rounded-xl bg-[#fcee0a] hover:bg-[#ffea00] text-black font-black font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
            <KanbanBoard
              tasks={tasks}
              onToggleStatus={handleToggleTaskStatus}
              onEdit={(t) => {
                soundFX.playBlip();
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onMoveTask={handleMoveTaskInKanban}
              onNewTaskInColumn={handleNewTaskInColumn}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="pb-2 border-b border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Velocity & Completion Analytics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Completion streaks, burndown rates, source distribution, and historical logs
              </p>
            </div>
            <AnalyticsView tasks={tasks} />
          </div>
        );

      case 'organizer':
        return <DesktopFileOrganizer />;

      case 'hover_window':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-[#fcee0a]/30 shadow-xl space-y-4 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fcee0a] to-cyan-400 flex items-center justify-center text-black font-black shadow-lg shadow-[#fcee0a]/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">
                      HUD Hover Sorting Lab
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Floating window enabled. Drag across screen or drop tasks & files here.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setIsHoverWindowOpen((prev) => !prev);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isHoverWindowOpen
                      ? 'bg-[#fcee0a] text-black border-[#fcee0a] shadow-md shadow-[#fcee0a]/30'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-[#fcee0a]'
                  }`}
                >
                  {isHoverWindowOpen ? 'HUD Window Active (H to toggle)' : 'Launch HUD Window'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-[#fcee0a] uppercase tracking-wider block">
                    Mode 1: Task Auto-Categorization
                  </span>
                  <p className="text-xs text-zinc-300">
                    Drop task text or paste action items. Gemini AI infers project category, priority levels, estimated durations, and subtasks, automatically inserting them into your task matrix.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Mode 2: File Destination Routing
                  </span>
                  <p className="text-xs text-zinc-300">
                    Drop files or type filenames. The neural classifier matches files against destination folders (Legal, Media, Code, Data, Classroom, Backups) with semantic reasoning.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick in-page Drop Tester */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-bold text-white font-mono mb-2">
                Quick AI Inference Tester
              </h3>
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Test categorizing a sample task directly:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Resolve WebSocket memory leak and disconnect listeners on unmount',
                  'Distributed Systems: Finish Raft election log verification',
                  'Review Q3 security SLA contract and liability terms',
                  'Design high-contrast OLED dark theme for VS Code extension',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFX.playBlip();
                      setIsHoverWindowOpen(true);
                      handleTaskCreatedFromHoverWindow({
                        id: `task-sample-${Date.now()}-${idx}`,
                        title: sample,
                        description: `Auto-categorized sample task processed via HUD Lab`,
                        project: idx % 2 === 0 ? 'Backend & API' : 'Classroom / Study',
                        priority: idx === 0 ? 'Urgent' : 'High',
                        status: 'todo',
                        tags: ['ai-test', 'lab'],
                        subtasks: [
                          { id: `st-${Date.now()}-1`, title: 'Verify unit test pass', completed: false },
                          { id: `st-${Date.now()}-2`, title: 'Deploy patch to dev server', completed: false },
                        ],
                        source: 'drop_window',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        estimatedMinutes: 45,
                      });
                      soundFX.playSuccess();
                      triggerTaskCompletionEffect();
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-[#fcee0a]/20 text-zinc-300 hover:text-[#fcee0a] border border-zinc-800 hover:border-[#fcee0a]/40 font-mono transition-colors cursor-pointer text-left"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'connectors':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>Connected Applications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fcee0a]/20 text-[#fcee0a] border border-[#fcee0a]/30">
                    {connectors.filter((c) => c.connected).length} ACTIVE
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Sync tasks and deadlines from VS Code, Claude, Git, Gmail, and Google Classroom
                </p>
              </div>

              <button
                onClick={() => setIsConnectorsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Configure Integrations</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((c) => {
                const getAppIcon = () => {
                  switch (c.iconName) {
                    case 'Code':
                      return <Code className="w-5 h-5 text-sky-400" />;
                    case 'Bot':
                      return <Bot className="w-5 h-5 text-amber-400" />;
                    case 'GitPullRequest':
                      return <GitPullRequest className="w-5 h-5 text-orange-400" />;
                    case 'Mail':
                      return <Mail className="w-5 h-5 text-rose-400" />;
                    case 'GraduationCap':
                      return <GraduationCap className="w-5 h-5 text-emerald-400" />;
                    default:
                      return <Layers className="w-5 h-5 text-indigo-400" />;
                  }
                };

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-3 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {getAppIcon()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{c.name}</h3>
                          <span className="text-[10px] text-zinc-400">{c.authType.toUpperCase()}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {c.connected ? 'CONNECTED' : 'STANDBY'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">{c.description}</p>
                    <p className="text-[11px] text-zinc-500 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60 truncate">
                      {c.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                      <span>Sync interval: Every {c.syncIntervalMin}m</span>
                      <button
                        onClick={() => {
                          soundFX.playBlip();
                          setIsConnectorsModalOpen(true);
                        }}
                        className="text-[#fcee0a] hover:underline cursor-pointer"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'themes':
        return (
          <ThemeShowcase
            currentTheme={theme}
            onSelectTheme={handleSelectTheme}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        );

      case 'darkmode_sync':
        return (
          <div className="space-y-6 font-mono">
            <div className="pb-2 border-b border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>System-Wide Dark Mode & App Sync</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fcee0a]/20 text-[#fcee0a] border border-[#fcee0a]/30">
                  SYSTEM READY
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Synchronize color schemes and export configs to VS Code, Claude, Git, Gmail, and Google Classroom
              </p>
            </div>

            {/* Dark Mode Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'cyberpunk' as ThemeMode, name: 'Cyberpunk 2077', icon: Moon, desc: 'OLED #000 with yellow & cyan' },
                { id: 'synthwave' as ThemeMode, name: 'Synthwave Skyline', icon: Moon, desc: 'Night City dusk neon' },
                { id: 'matrix' as ThemeMode, name: 'Matrix Terminal', icon: Moon, desc: 'Green CRT phosphor' },
                { id: 'solar' as ThemeMode, name: 'Tokyo Solar (Light)', icon: Sun, desc: 'High-contrast light' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = theme === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectTheme(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#fcee0a]/10 border-[#fcee0a] shadow-lg shadow-[#fcee0a]/20 text-[#fcee0a]'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="block text-xs font-bold text-white">{m.name}</span>
                    <span className="block text-[10px] text-zinc-400 mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Export Configs */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Cross-Application Theme Exporter</h3>
                  <p className="text-xs text-zinc-400">
                    Apply consistent dark mode themes across your entire engineering setup
                  </p>
                </div>
                <button
                  onClick={() => setIsThemeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#fcee0a] text-black text-xs font-black cursor-pointer shadow-sm"
                >
                  Open Full Exporter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Code className="w-4 h-4" />
                    <span>VS Code settings.json</span>
                  </div>
                  <pre className="text-[10px] text-zinc-300 bg-zinc-900/90 p-2 rounded-lg overflow-x-auto">
                    {`{\n  "workbench.colorTheme": "Default Dark Modern",\n  "window.autoDetectColorScheme": true\n}`}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Bot className="w-4 h-4" />
                    <span>Claude Desktop & Web</span>
                  </div>
                  <pre className="text-[10px] text-zinc-300 bg-zinc-900/90 p-2 rounded-lg overflow-x-auto">
                    {`{\n  "claude.appearance": "dark",\n  "claude.contrast": "high"\n}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-zinc-100 transition-colors selection:bg-[#fcee0a]/30 selection:text-[#fcee0a] relative overflow-x-hidden flex flex-col bg-[#070710]">
      {/* Opening Intro Neural Gateway (Dismissable / Replayable) */}
      <AnimatePresence>
        {showOpeningIntro && (
          <OpeningIntro
            onEnterApp={() => setShowOpeningIntro(false)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}
      </AnimatePresence>

      {/* Cyberpunk Scanline Effect */}
      {theme === 'cyberpunk' && <div className="scanline-effect pointer-events-none"></div>}

      {/* Top Navbar */}
      <Navbar
        syncState={syncState}
        onManualSync={handleManualSync}
        onOpenConnectors={() => setIsConnectorsModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onToggleHoverWindow={() => setIsHoverWindowOpen((prev) => !prev)}
        isHoverWindowOpen={isHoverWindowOpen}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'cyberpunk' ? 'synthwave' : 'cyberpunk';
          handleSelectTheme(next);
        }}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode((prev) => (prev === 'desktop' ? 'mobile_preview' : 'desktop'))
        }
        activeFeature={activeFeature}
        onSelectFeature={setActiveFeature}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenNewTaskModal={() => {
          soundFX.playBlip();
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenMusicPlayer={() => setIsMusicPlayerModalOpen(true)}
      />

      {/* Cyber BGM Soundtrack Bar */}
      <div className="bg-black/95 border-b border-[#fcee0a]/20 px-3 sm:px-6 py-2 flex items-center justify-between text-xs font-mono">
        <input
          ref={quickAudioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleQuickAudioUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => {
              soundFX.playBlip();
              soundFX.togglePlay();
            }}
            className="w-7 h-7 rounded-lg bg-[#fcee0a] hover:bg-[#ffea00] text-black flex items-center justify-center shrink-0 cursor-pointer shadow-sm shadow-[#fcee0a]/20"
            title={isPlayingAudio ? 'Pause Audio' : 'Play Audio'}
          >
            {isPlayingAudio ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          <div
            onClick={() => {
              soundFX.playBlip();
              setIsMusicPlayerModalOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 overflow-hidden"
            title="Click to open Cyber Soundtrack Station (Upload / Switch Track)"
          >
            <span className="w-2 h-2 rounded-full bg-[#fcee0a] animate-ping shrink-0"></span>
            <span className="text-[#fcee0a] font-bold shrink-0">SOUNDTRACK:</span>
            <span className="text-zinc-200 truncate text-[11px] sm:text-xs hover:underline decoration-[#fcee0a]">
              "{activeTrackName}" {soundFX.currentTrack.source === 'custom_file' ? '(Custom Loaded)' : '— Dawid Podsiadło'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => quickAudioInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload audio file to play your custom soundtrack"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Upload Track</span>
          </button>

          <button
            onClick={() => {
              soundFX.playBlip();
              setIsMusicPlayerModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[#fcee0a] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Open Full Cyber Player & Lyrics"
          >
            <Disc className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Audio Station</span>
          </button>

          <button
            onClick={() => {
              soundFX.playBlip();
              setShowOpeningIntro(true);
            }}
            className="text-[10px] text-zinc-400 hover:text-[#fcee0a] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Intro</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="text-[10px] font-bold text-[#fcee0a] bg-[#fcee0a]/20 border border-[#fcee0a]/40 px-2 py-0.5 rounded cursor-pointer"
          >
            {isMuted ? 'UNMUTE BGM' : 'MUTED'}
          </button>
        </div>
      </div>

      {/* App Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeFeature={activeFeature}
            onSelectFeature={(feat) => {
              setActiveFeature(feat);
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            syncState={syncState}
            onManualSync={handleManualSync}
            theme={theme}
            viewMode={viewMode}
            onToggleViewMode={() =>
              setViewMode((prev) => (prev === 'desktop' ? 'mobile_preview' : 'desktop'))
            }
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onReplayIntro={() => setShowOpeningIntro(true)}
            tasksCount={tasksCount}
            connectedAppsCount={connectors.filter((c) => c.connected).length}
            isHoverWindowOpen={isHoverWindowOpen}
            onToggleHoverWindow={() => setIsHoverWindowOpen((prev) => !prev)}
            onOpenMusicPlayer={() => setIsMusicPlayerModalOpen(true)}
          />
        </div>

        {/* Mobile Sidebar Slide-Over Drawer */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-[#070710] shadow-2xl md:hidden"
              >
                <Sidebar
                  activeFeature={activeFeature}
                  onSelectFeature={(feat) => {
                    setActiveFeature(feat);
                    setIsMobileSidebarOpen(false);
                  }}
                  isCollapsed={false}
                  onToggleCollapse={() => setIsMobileSidebarOpen(false)}
                  onOpenNewTaskModal={() => {
                    setIsMobileSidebarOpen(false);
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  syncState={syncState}
                  onManualSync={handleManualSync}
                  theme={theme}
                  viewMode={viewMode}
                  onToggleViewMode={() => {
                    setIsMobileSidebarOpen(false);
                    setViewMode((prev) => (prev === 'desktop' ? 'mobile_preview' : 'desktop'));
                  }}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  onReplayIntro={() => {
                    setIsMobileSidebarOpen(false);
                    setShowOpeningIntro(true);
                  }}
                  tasksCount={tasksCount}
                  connectedAppsCount={connectors.filter((c) => c.connected).length}
                  isHoverWindowOpen={isHoverWindowOpen}
                  onToggleHoverWindow={() => {
                    setIsHoverWindowOpen((prev) => !prev);
                  }}
                  onOpenMusicPlayer={() => {
                    setIsMobileSidebarOpen(false);
                    setIsMusicPlayerModalOpen(true);
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full box-border">
          {viewMode === 'desktop' ? (
            <div className="w-full max-w-full overflow-x-hidden">
              {renderFeatureContent()}
            </div>
          ) : (
            /* Android Mobile Preview Frame (With Zero Cutoff & Perfect Fitting) */
            <div className="flex flex-col items-center justify-center py-2 sm:py-4 w-full">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-[400px] h-[820px] rounded-[48px] bg-zinc-950 p-3 shadow-2xl border-4 border-[#fcee0a]/40 relative overflow-hidden flex flex-col box-border"
              >
                {/* Android Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800"></div>
                </div>

                {/* Android Status Bar */}
                <div className="h-7 w-full flex items-center justify-between px-6 pt-2 text-[11px] font-semibold text-[#fcee0a] z-30 select-none font-mono">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase">5G</span>
                    <BatteryCharging className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Android Screen Inner Container */}
                <div className="flex-1 bg-[#090912] rounded-[38px] overflow-y-auto overflow-x-hidden p-2.5 pt-3 pb-16 box-border text-xs">
                  {/* Android Quick Nav Pill Ribbon */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 font-mono border-b border-zinc-800 scrollbar-none">
                    {(
                      [
                        { id: 'tasks', label: 'Tasks' },
                        { id: 'kanban', label: 'Kanban' },
                        { id: 'analytics', label: 'Stats' },
                        { id: 'organizer', label: 'Files' },
                        { id: 'connectors', label: 'Apps' },
                        { id: 'themes', label: 'Themes' },
                      ] as const
                    ).map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => {
                          soundFX.playBlip();
                          setActiveFeature(pill.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                          activeFeature === pill.id
                            ? 'bg-[#fcee0a] text-black shadow-xs font-black'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {renderFeatureContent()}
                </div>

                {/* Android Gesture Bottom Pill */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#fcee0a]/70 rounded-full z-40"></div>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Hover Window Widget - Freely Draggable Anywhere */}
      <HoverSortingWindow
        isOpen={isHoverWindowOpen}
        onClose={() => setIsHoverWindowOpen(false)}
        destinationFolders={availableDestinationFolders}
        onTaskCreated={handleTaskCreatedFromHoverWindow}
        onFileRouted={(fileName, folder) => {
          console.log(`Routed ${fileName} to ${folder}`);
        }}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
        existingProjects={existingProjects}
      />

      {/* App Connectors Modal (VS Code, Claude, Git, Gmail, Classroom) */}
      <AppConnectorsModal
        isOpen={isConnectorsModalOpen}
        onClose={() => setIsConnectorsModalOpen(false)}
        connectors={connectors}
        onUpdateConnectors={handleUpdateConnectors}
        onImportTasks={handleImportTasksFromConnectors}
      />

      {/* System-Wide Dark Mode & Theme Sync Modal */}
      <ThemeSyncModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}
