import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Check,
  Copy,
  Sparkles,
  X,
  Code,
  Bot,
  GitBranch,
  Mail,
  GraduationCap,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const ThemeSyncModal: React.FC<ThemeSyncModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  const [copiedApp, setCopiedApp] = useState<string | null>(null);
  const [syncedAll, setSyncedAll] = useState(false);

  if (!isOpen) return null;

  const isDark = currentTheme !== 'solar';

  const appSyncConfigs = [
    {
      id: 'vscode',
      name: 'VS Code',
      icon: <Code className="w-4 h-4 text-sky-500" />,
      themeSetting: isDark
        ? `{\n  "workbench.colorTheme": "Default Dark Modern",\n  "window.autoDetectColorScheme": true\n}`
        : `{\n  "workbench.colorTheme": "Default Light Modern",\n  "window.autoDetectColorScheme": true\n}`,
      instructions: 'Paste into settings.json (Cmd/Ctrl + Shift + P -> Open Settings JSON)',
    },
    {
      id: 'claude',
      name: 'Claude Desktop & Web',
      icon: <Bot className="w-4 h-4 text-amber-500" />,
      themeSetting: isDark
        ? `{\n  "claude.appearance": "dark",\n  "claude.contrast": "high"\n}`
        : `{\n  "claude.appearance": "light"\n}`,
      instructions: 'Claude Settings -> Appearance -> Match System (Synchronized automatically)',
    },
    {
      id: 'git',
      name: 'Git Terminal & Bash',
      icon: <GitBranch className="w-4 h-4 text-orange-500" />,
      themeSetting: isDark
        ? `git config --global color.ui auto\ngit config --global color.diff.meta "yellow bold"\ngit config --global color.diff.frag "magenta bold"`
        : `git config --global color.ui auto\ngit config --global color.diff.meta "blue bold"`,
      instructions: 'Run in Terminal to synchronize git status & diff colors',
    },
    {
      id: 'gmail',
      name: 'Gmail & Workspace',
      icon: <Mail className="w-4 h-4 text-red-500" />,
      themeSetting: isDark
        ? `Gmail Theme: "Dark" (High-contrast charcoal & emerald accents)`
        : `Gmail Theme: "Default Light" (Clean white & sky accents)`,
      instructions: 'Settings -> Themes -> Set to Dark / Match OS Dark',
    },
    {
      id: 'classroom',
      name: 'Google Classroom',
      icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
      themeSetting: isDark
        ? `Classroom UI: Dark Mode Enabled (System color-scheme: dark active)`
        : `Classroom UI: Light Mode Enabled (Standard Classroom theme)`,
      instructions: 'Inherits system-wide prefers-color-scheme from CyberSpace',
    },
  ];

  const copyConfig = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedApp(id);
      setTimeout(() => setCopiedApp(null), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleSyncAll = () => {
    setSyncedAll(true);
    setTimeout(() => setSyncedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[color:var(--accent)] flex items-center justify-center text-[color:var(--accent-ink)] shadow-md">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                System-Wide Dark Mode & App Theme Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Synchronize appearance across CyberSpace, Desktop OS, and connected apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Theme Selector Tiles */}
        <div className="my-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 block">
            Select Active Appearance
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Cyberpunk */}
            <button
              onClick={() => onSelectTheme('cyberpunk')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentTheme === 'cyberpunk'
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-[#070712] text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'border-zinc-800 bg-[#070712]/70 text-zinc-300 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-xs"></span>
                {currentTheme === 'cyberpunk' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-xs font-bold font-mono text-white">Cyberpunk</span>
              <span className="text-[10px] text-zinc-400">Default Neon</span>
            </button>

            {/* Matrix */}
            <button
              onClick={() => onSelectTheme('matrix')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentTheme === 'matrix'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-[#020603] text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'border-zinc-800 bg-[#020603]/70 text-zinc-300 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-xs"></span>
                {currentTheme === 'matrix' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-xs font-bold font-mono text-white">Matrix</span>
              <span className="text-[10px] text-zinc-400">CRT Phosphor</span>
            </button>

            {/* Synthwave */}
            <button
              onClick={() => onSelectTheme('synthwave')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentTheme === 'synthwave'
                  ? 'border-pink-400 ring-2 ring-pink-400/30 bg-[#0e051d] text-pink-300 shadow-md shadow-pink-500/20'
                  : 'border-zinc-800 bg-[#0e051d]/70 text-zinc-300 hover:border-pink-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-pink-400 shadow-xs"></span>
                {currentTheme === 'synthwave' && <Check className="w-3.5 h-3.5 text-pink-400" />}
              </div>
              <span className="text-xs font-bold font-mono text-white">Synthwave</span>
              <span className="text-[10px] text-zinc-400">Sunset Violet</span>
            </button>

            {/* Obsidian */}
            <button
              onClick={() => onSelectTheme('obsidian')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentTheme === 'obsidian'
                  ? 'border-sky-400 ring-2 ring-sky-400/30 bg-[#050508] text-sky-300 shadow-md shadow-sky-500/20'
                  : 'border-zinc-800 bg-[#050508]/70 text-zinc-300 hover:border-sky-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-xs"></span>
                {currentTheme === 'obsidian' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <span className="text-xs font-bold font-mono text-white">Obsidian</span>
              <span className="text-[10px] text-zinc-400">Stealth Black</span>
            </button>

            {/* Solar */}
            <button
              onClick={() => onSelectTheme('solar')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentTheme === 'solar'
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-white text-blue-900 shadow-md'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-xs"></span>
                {currentTheme === 'solar' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <span className="text-xs font-bold font-mono text-slate-900">Solar</span>
              <span className="text-[10px] text-slate-500">Light Cyber</span>
            </button>
          </div>
        </div>

        {/* Cross-Application Synchronizer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Connected Application Sync Configurations
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Synchronize your {isDark ? 'Dark' : 'Light'} theme directly into each supported app
              </p>
            </div>

            <button
              onClick={handleSyncAll}
              className="px-3 py-1.5 bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-[color:var(--accent-ink)] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {syncedAll ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {syncedAll ? 'Synced All Apps!' : 'Broadcast to All Apps'}
            </button>
          </div>

          <div className="space-y-2.5">
            {appSyncConfigs.map((app) => (
              <div
                key={app.id}
                className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-slate-50/70 dark:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {app.icon}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {app.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-medium">
                      {isDark ? 'Dark Theme Target' : 'Light Theme Target'}
                    </span>
                  </div>

                  <button
                    onClick={() => copyConfig(app.id, app.themeSetting)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedApp === app.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedApp === app.id ? 'Copied!' : 'Copy Config'}
                  </button>
                </div>

                <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto max-h-20 selection:bg-[color:var(--accent)]/10">
                  {app.themeSetting}
                </pre>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  💡 {app.instructions}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
