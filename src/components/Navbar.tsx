import React from 'react';
import { motion } from 'motion/react';
import {
  FolderSync,
  Sparkles,
  Layers,
  Smartphone,
  Laptop,
  Palette,
  Cloud,
  CloudOff,
  RefreshCw,
  Volume2,
  VolumeX,
  Menu,
  Plus,
  CheckSquare,
  LayoutGrid,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { SyncState, ThemeMode } from '../types';
import { soundFX } from '../lib/audio';
import { ActiveFeature } from './Sidebar';

interface NavbarProps {
  syncState: SyncState;
  onManualSync: () => void;
  onOpenConnectors: () => void;
  onOpenThemeModal: () => void;
  onToggleHoverWindow: () => void;
  isHoverWindowOpen: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  viewMode: 'desktop' | 'mobile_preview';
  onToggleViewMode: () => void;
  activeFeature: ActiveFeature;
  onSelectFeature: (feature: ActiveFeature) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenNewTaskModal: () => void;
  onToggleMobileSidebar: () => void;
  onOpenMusicPlayer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncState,
  onManualSync,
  onOpenConnectors,
  onOpenThemeModal,
  onToggleHoverWindow,
  isHoverWindowOpen,
  theme,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  activeFeature,
  onSelectFeature,
  isMuted,
  onToggleMute,
  onOpenNewTaskModal,
  onToggleMobileSidebar,
  onOpenMusicPlayer,
}) => {
  const getFeatureTitle = () => {
    switch (activeFeature) {
      case 'tasks':
        return 'Tasks Tracker';
      case 'kanban':
        return 'Kanban Board';
      case 'analytics':
        return 'Velocity Analytics';
      case 'organizer':
        return 'Desktop File Organizer';
      case 'hover_window':
        return 'HUD Hover Sorting Lab';
      case 'connectors':
        return 'Connected Applications';
      case 'themes':
        return 'Cyber Themes Showcase';
      case 'darkmode_sync':
        return 'Dark Mode & App Sync';
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#fcee0a]/20 bg-[#070710]/90 backdrop-blur-2xl transition-colors">
      <div className="w-full px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Sidebar Hamburger */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleMobileSidebar();
            }}
            className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-[#fcee0a] bg-zinc-900 border border-zinc-800 cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black text-white tracking-tight text-sm sm:text-base font-mono">
              TaskOrbit <span className="text-[#fcee0a]">CyberStudio</span>
            </span>
            <span className="hidden sm:inline-block text-zinc-600 font-mono">/</span>
            <span className="hidden sm:inline-block text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/30">
              {getFeatureTitle()}
            </span>
          </div>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick New Task Button */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onOpenNewTaskModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fcee0a] hover:bg-[#ffea00] text-black text-xs font-mono font-black border border-black shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Task</span>
          </button>

          {/* Draggable Hover Window Toggle Button */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleHoverWindow();
            }}
            title={isHoverWindowOpen ? 'Close Hover Sorting Window' : 'Open Hover Sorting Window (H)'}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isHoverWindowOpen
                ? 'bg-[#fcee0a] text-black border-[#fcee0a] shadow-xs'
                : 'text-zinc-300 bg-zinc-900 border-zinc-800 hover:border-[#fcee0a]/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HUD Window</span>
          </button>

          {/* Device Preview Toggle (Desktop vs Android) */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleViewMode();
            }}
            title={viewMode === 'desktop' ? 'Switch to Android Mobile View' : 'Switch to Desktop View'}
            className="p-2 rounded-xl text-zinc-300 hover:text-[#fcee0a] bg-zinc-900 border border-zinc-800 hover:border-[#fcee0a]/40 transition-colors cursor-pointer"
          >
            {viewMode === 'desktop' ? (
              <Smartphone className="w-4 h-4 text-cyan-400" />
            ) : (
              <Laptop className="w-4 h-4 text-[#fcee0a]" />
            )}
          </button>

          {/* Cloud Sync Status */}
          <button
            onClick={onManualSync}
            disabled={syncState.isSyncing}
            title={syncState.isOnline ? 'Online: Click to sync with Cloud Vault' : 'Offline: Changes stored locally'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-[#fcee0a]/40 transition-colors cursor-pointer"
          >
            {syncState.isOnline ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-[#fcee0a]' : 'text-zinc-400'}`}
            />
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleTheme();
            }}
            title="Toggle Cyberpunk / Synthwave Theme"
            className="p-2 rounded-xl text-zinc-300 hover:text-[#fcee0a] bg-zinc-900 border border-zinc-800 hover:border-[#fcee0a]/40 transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Cyber Soundtrack Station Trigger */}
          {onOpenMusicPlayer && (
            <button
              onClick={() => {
                soundFX.playBlip();
                onOpenMusicPlayer();
              }}
              title="Cyber Soundtrack Station (Switch / Upload Audio)"
              className="p-2 rounded-xl text-zinc-300 hover:text-cyan-300 bg-zinc-900 border border-zinc-800 hover:border-cyan-400/40 transition-colors cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#fcee0a] animate-pulse" />
            </button>
          )}

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound Effects & BGM' : 'Mute Audio'}
            className="p-2 rounded-xl text-zinc-300 hover:text-[#fcee0a] bg-zinc-900 border border-zinc-800 hover:border-[#fcee0a]/40 transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#fcee0a] animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
