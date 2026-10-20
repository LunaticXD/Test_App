import React from 'react';
import { motion } from 'motion/react';
import {
  CheckSquare,
  LayoutGrid,
  TrendingUp,
  FolderSync,
  Sparkles,
  Layers,
  Palette,
  Moon,
  Plus,
  RefreshCw,
  Cloud,
  CloudOff,
  Volume2,
  VolumeX,
  Laptop,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Radio,
  RotateCcw,
  Zap,
  Home as HomeIcon,
} from 'lucide-react';
import { SyncState, ThemeMode } from '../types';
import { soundFX } from '../lib/audio';

export type ActiveFeature =
  | 'home'
  | 'tasks'
  | 'kanban'
  | 'analytics'
  | 'organizer'
  | 'hover_window'
  | 'connectors'
  | 'themes'
  | 'darkmode_sync';

interface SidebarProps {
  activeFeature: ActiveFeature;
  onSelectFeature: (feature: ActiveFeature) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewTaskModal: () => void;
  syncState: SyncState;
  onManualSync: () => void;
  theme: ThemeMode;
  viewMode: 'desktop' | 'mobile_preview';
  onToggleViewMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayIntro: () => void;
  tasksCount: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
  connectedAppsCount: number;
  isHoverWindowOpen: boolean;
  onToggleHoverWindow: () => void;
  onOpenMusicPlayer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFeature,
  onSelectFeature,
  isCollapsed,
  onToggleCollapse,
  onOpenNewTaskModal,
  syncState,
  onManualSync,
  theme,
  viewMode,
  onToggleViewMode,
  isMuted,
  onToggleMute,
  onReplayIntro,
  tasksCount,
  connectedAppsCount,
  isHoverWindowOpen,
  onToggleHoverWindow,
  onOpenMusicPlayer,
}) => {
  const navItems: {
    id: ActiveFeature;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    desc: string;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      desc: 'Welcome hub & quick launch',
    },
    {
      id: 'tasks',
      label: 'Tasks Tracker',
      icon: CheckSquare,
      badge: tasksCount.todo,
      badgeColor: 'bg-[color:var(--accent)] text-black font-black',
      desc: 'All tasks, AI breakdown & filters',
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: LayoutGrid,
      badge: tasksCount.inProgress > 0 ? tasksCount.inProgress : undefined,
      badgeColor: 'bg-cyan-400 text-black font-black',
      desc: 'To Do, In Progress & Done',
    },
    {
      id: 'analytics',
      label: 'Velocity & Stats',
      icon: TrendingUp,
      badge: `${tasksCount.total > 0 ? Math.round((tasksCount.completed / tasksCount.total) * 100) : 0}%`,
      badgeColor: 'bg-emerald-400 text-black font-black',
      desc: 'Velocity streaks & burndown',
    },
    {
      id: 'organizer',
      label: 'File Organizer',
      icon: FolderSync,
      badge: 'AUTO',
      badgeColor: 'bg-pink-500 text-white font-bold',
      desc: 'Sort desktop by type & date',
    },
    {
      id: 'hover_window',
      label: 'Hover Sorting Lab',
      icon: Sparkles,
      badge: isHoverWindowOpen ? 'ACTIVE' : 'READY',
      badgeColor: isHoverWindowOpen ? 'bg-cyan-400 text-black' : 'bg-zinc-800 text-zinc-400',
      desc: 'Floating quick-drop HUD AI',
    },
    {
      id: 'connectors',
      label: 'Connected Apps',
      icon: Layers,
      badge: connectedAppsCount,
      badgeColor: 'bg-[color:var(--accent)] text-black font-black',
      desc: 'VS Code, Claude, Git, Gmail, Class',
    },
    {
      id: 'themes',
      label: 'Cyber Themes',
      icon: Palette,
      badge: theme.toUpperCase(),
      badgeColor: 'bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-black',
      desc: 'Cyberpunk 2077, Synthwave, etc.',
    },
    {
      id: 'darkmode_sync',
      label: 'Dark Mode Sync',
      icon: Moon,
      desc: 'System dark mode & app exports',
    },
  ];

  return (
    <aside
      className={`shrink-0 transition-all duration-300 ease-in-out border-r border-[color:var(--accent)]/20 bg-[color:var(--bg)]/95 backdrop-blur-2xl flex flex-col justify-between z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Brand & Header */}
      <div className="p-3 border-b border-[color:var(--accent)]/20">
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={() => {
              soundFX.playBlip();
              onSelectFeature('home');
            }}
            title="Go to Home"
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[color:var(--accent)] via-cyan-400 to-[color:var(--tertiary)] p-0.5 shrink-0 shadow-lg shadow-[color:var(--accent)]/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <Zap className="w-5 h-5 text-[color:var(--accent)] animate-pulse" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm text-white tracking-wider uppercase">
                    CYBER<span className="text-[color:var(--accent)]">SPACE</span>
                  </span>
                  <span className="text-[9px] font-black font-mono px-1.5 py-0.2 rounded-sm bg-[color:var(--accent)]/20 text-[color:var(--accent)] border border-[color:var(--accent)]/40">
                    2077
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  Cyber OS Navigation Matrix
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleCollapse();
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-[color:var(--accent)] bg-zinc-900 border border-zinc-800 hover:border-[color:var(--accent)]/40 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick New Task Button */}
        <div className="mt-3">
          <button
            onClick={() => {
              soundFX.playBlip();
              onOpenNewTaskModal();
            }}
            title="Create New Task"
            className={`w-full py-2.5 rounded-xl bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-black font-black font-mono text-xs tracking-wider uppercase shadow-md shadow-[color:var(--accent)]/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-black ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {!isCollapsed && <span>NEW TASK</span>}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <p className="px-2.5 pb-1 text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">
            FEATURES // HUB
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFeature === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundFX.playBlip();
                onSelectFeature(item.id);
              }}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[color:var(--accent)]/20 via-cyan-500/10 to-transparent text-[color:var(--accent)] border border-[color:var(--accent)]/50 shadow-sm shadow-[color:var(--accent)]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800'
              }`}
            >
              {/* Active Neon Left Pip */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[color:var(--accent)] rounded-r-full shadow-md shadow-[color:var(--accent)]/80"></span>
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[color:var(--accent)]' : 'text-zinc-400 group-hover:text-cyan-400'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 text-left truncate flex items-center justify-between gap-1">
                  <div className="truncate">
                    <span className="block truncate tracking-tight">{item.label}</span>
                    <span className="block text-[10px] font-normal text-zinc-400 truncate">
                      {item.desc}
                    </span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono shrink-0 ${
                        item.badgeColor || 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Floating Sorting Window Quick Toggle in Sidebar */}
        <div className="pt-2 px-1">
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleHoverWindow();
            }}
            className={`w-full py-2 px-2.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
              isHoverWindowOpen
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {!isCollapsed && <span>HUD Window</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/60 border border-cyan-500/30 text-cyan-400 font-mono">
                {isHoverWindowOpen ? 'ON' : 'OFF'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Footer Matrix: Cloud Sync, BGM, Viewport Switch */}
      <div className="p-3 border-t border-[color:var(--accent)]/20 bg-black/60 space-y-2.5 text-xs font-mono">
        {/* Cloud Sync Telemetry */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            {syncState.isOnline ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            {!isCollapsed && (
              <span className="text-[10px] truncate text-zinc-300">
                {syncState.isOnline ? 'CLOUD SYNC VAULT' : 'OFFLINE CACHED'}
              </span>
            )}
          </div>

          <button
            onClick={onManualSync}
            disabled={syncState.isSyncing}
            title="Trigger Manual Cloud Sync"
            className="p-1 rounded text-zinc-400 hover:text-[color:var(--accent)] hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-[color:var(--accent)]' : ''}`}
            />
          </button>
        </div>

        {/* Let You Down Cyber BGM Control */}
        <div
          onClick={() => {
            if (onOpenMusicPlayer) {
              soundFX.playBlip();
              onOpenMusicPlayer();
            }
          }}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[color:var(--accent)]/40 flex items-center justify-between cursor-pointer transition-colors group"
          title="Click to open Cyber Soundtrack Station (Upload / Switch Track)"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Radio className="w-3.5 h-3.5 text-[color:var(--tertiary)] shrink-0 animate-pulse group-hover:scale-110 transition-transform" />
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-[9px] text-[color:var(--accent)] font-bold uppercase truncate">
                  CYBER SOUNDTRACK
                </span>
                <span className="block text-[9px] text-zinc-400 group-hover:text-white truncate">
                  "Let You Down" OST
                </span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute OST' : 'Mute OST'}
            className="p-1 rounded-md text-zinc-400 hover:text-[color:var(--accent)] bg-zinc-900 border border-zinc-800 cursor-pointer shrink-0"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[color:var(--accent)] animate-pulse" />
            )}
          </button>
        </div>

        {/* View Mode Switcher (Desktop vs Android Simulator) */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={onToggleViewMode}
            className="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 text-[11px] cursor-pointer"
          >
            {viewMode === 'desktop' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[color:var(--secondary)]" />
                {!isCollapsed && <span>Android View</span>}
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-[color:var(--accent)]" />
                {!isCollapsed && <span>Desktop View</span>}
              </>
            )}
          </button>

          {!isCollapsed && (
            <button
              onClick={() => {
                soundFX.playBlip();
                onReplayIntro();
              }}
              title="Replay Cyberpunk Intro"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-[color:var(--accent)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
