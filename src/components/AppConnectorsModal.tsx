import React, { useState } from 'react';
import {
  Layers,
  X,
  Code,
  Bot,
  GitPullRequest,
  Mail,
  GraduationCap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  DownloadCloud,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { AppConnectorConfig, Task } from '../types';
import { triggerTaskCompletionEffect } from '../lib/celebrate';

interface AppConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: AppConnectorConfig[];
  onUpdateConnectors: (updated: AppConnectorConfig[]) => void;
  onImportTasks: (newTasks: Task[]) => void;
}

export const AppConnectorsModal: React.FC<AppConnectorsModalProps> = ({
  isOpen,
  onClose,
  connectors,
  onUpdateConnectors,
  onImportTasks,
}) => {
  const [importingApp, setImportingApp] = useState<string | null>(null);
  const [lastImportCount, setLastImportCount] = useState<{ [app: string]: number }>({});

  if (!isOpen) return null;

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-sky-500" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-amber-500" />;
      case 'GitPullRequest':
        return <GitPullRequest className="w-5 h-5 text-orange-500" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-rose-500" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-emerald-500" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleToggleConnection = (id: string) => {
    const updated = connectors.map((c) =>
      c.id === id ? { ...c, connected: !c.connected } : c
    );
    onUpdateConnectors(updated);
  };

  const handleImport = async (appId: string) => {
    setImportingApp(appId);
    try {
      const res = await fetch('/api/app-connectors/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appId }),
      });

      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) {
        onImportTasks(data.tasks);
        setLastImportCount((prev) => ({ ...prev, [appId]: data.tasks.length }));
        triggerTaskCompletionEffect();
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImportingApp(null);
    }
  };

  const handleImportAll = async () => {
    for (const c of connectors) {
      if (c.connected) {
        await handleImport(c.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Application Connectors & Integrations Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Connect VS Code, Claude, Git, Gmail, and Google Classroom to ingest and sync tasks
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

        {/* Global Import Action */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Unified Multi-App Synchronization
            </span>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Syncs TODO comments, AI conversation action items, GitHub PRs, flagged emails, and Classroom assignments
            </p>
          </div>

          <button
            onClick={handleImportAll}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <DownloadCloud className="w-4 h-4" />
            Sync All Connected Apps
          </button>
        </div>

        {/* Connectors List */}
        <div className="space-y-3">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className={`p-4 rounded-xl border transition-all ${
                connector.connected
                  ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-700/60">
                    {getAppIcon(connector.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {connector.name}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          connector.connected
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {connector.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {connector.description}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
                      {connector.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleConnection(connector.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    title={connector.connected ? 'Disconnect App' : 'Connect App'}
                  >
                    {connector.connected ? (
                      <ToggleRight className="w-7 h-7 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>

                  <button
                    disabled={!connector.connected || importingApp === connector.id}
                    onClick={() => handleImport(connector.id)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {importingApp === connector.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <DownloadCloud className="w-3.5 h-3.5" />
                    )}
                    {importingApp === connector.id ? 'Importing...' : 'Import Action Items'}
                  </button>
                </div>
              </div>

              {lastImportCount[connector.id] && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Imported {lastImportCount[connector.id]} new tasks from {connector.name}
                  </span>
                  <span className="text-slate-400 text-[10px]">Just now</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
