import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderSync,
  FolderTree,
  Calendar,
  FileType,
  Sparkles,
  Download,
  Copy,
  Check,
  Upload,
  RefreshCw,
  FolderCheck,
  FileCode,
  FileText,
  Image as ImageIcon,
  Archive,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Trash2,
  FolderPlus,
  Plus,
  HelpCircle,
  Folder,
  Layers,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Edit3,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
} from 'lucide-react';
import { DesktopFile, FileSortRule, OrganizedFileResult, DestinationFolderConfig } from '../types';
import {
  organizeFilesWithAI,
  generateFileCleanupScript,
  createOrganizedZipDownload,
} from '../lib/gemini';
import { triggerTaskCompletionEffect } from '../lib/celebrate';
import { soundFX } from '../lib/audio';

const DEMO_DESKTOP_FILES: DesktopFile[] = [
  {
    id: 'f-1',
    name: 'Screenshot 2026-10-14 at 10.32.15 AM.png',
    size: 2450000,
    type: 'image/png',
    lastModified: Date.now() - 86400000 * 3,
  },
  {
    id: 'f-2',
    name: 'Q3_Enterprise_Cloud_Contract_Draft.pdf',
    size: 1840000,
    type: 'application/pdf',
    lastModified: Date.now() - 86400000 * 4,
  },
  {
    id: 'f-3',
    name: 'cluster_orchestrator.ts',
    size: 45000,
    type: 'text/typescript',
    lastModified: Date.now() - 86400000 * 1,
  },
  {
    id: 'f-4',
    name: 'sales_funnel_october_data.csv',
    size: 512000,
    type: 'text/csv',
    lastModified: Date.now() - 86400000 * 6,
  },
  {
    id: 'f-5',
    name: 'CS448_Lab3_Raft_Benchmark.docx',
    size: 890000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    lastModified: Date.now() - 86400000 * 2,
  },
  {
    id: 'f-6',
    name: 'docker-compose.stage.yml',
    size: 12000,
    type: 'application/x-yaml',
    lastModified: Date.now() - 86400000 * 8,
  },
  {
    id: 'f-7',
    name: 'profile_keynote_presentation.pptx',
    size: 14200000,
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    lastModified: Date.now() - 86400000 * 15,
  },
  {
    id: 'f-8',
    name: 'legacy_backup_august_2026.zip',
    size: 45000000,
    type: 'application/zip',
    lastModified: Date.now() - 86400000 * 45,
  },
  {
    id: 'f-9',
    name: 'meeting_notes_architecture_sync.md',
    size: 18000,
    type: 'text/markdown',
    lastModified: Date.now() - 86400000 * 2,
  },
  {
    id: 'f-10',
    name: 'Hero_Banner_Dark_Mode_Mockup.png',
    size: 3800000,
    type: 'image/png',
    lastModified: Date.now() - 86400000 * 12,
  },
];

const INITIAL_DESTINATION_FOLDERS: DestinationFolderConfig[] = [
  {
    id: 'df-1',
    name: 'Client Contracts & Legal',
    path: 'Legal & Contracts',
    color: 'yellow',
    description: 'NDAs, signed agreements, SLAs, client proposals',
  },
  {
    id: 'df-2',
    name: 'Screenshots & Visuals',
    path: 'Media & Screenshots',
    color: 'pink',
    description: 'PNGs, JPEGs, mockups, design banners',
  },
  {
    id: 'df-3',
    name: 'Source Code & Scripts',
    path: 'Code & Scripts',
    color: 'cyan',
    description: 'TypeScript, Python, YAML configs, scripts',
  },
  {
    id: 'df-4',
    name: 'Data & Financials',
    path: 'Data & Spreadsheets',
    color: 'amber',
    description: 'CSV exports, Excel sheets, financial metrics',
  },
  {
    id: 'df-5',
    name: 'Classroom & Academic',
    path: 'Classroom / Study',
    color: 'purple',
    description: 'Assignments, coursework labs, lecture notes',
  },
  {
    id: 'df-6',
    name: 'Archives & Installers',
    path: 'Archives & Backups',
    color: 'sky',
    description: 'Zip archives, DMGs, legacy snapshots',
  },
];

export const DesktopFileOrganizer: React.FC = () => {
  const [files, setFiles] = useState<DesktopFile[]>(DEMO_DESKTOP_FILES);
  const [destinationFolders, setDestinationFolders] = useState<DestinationFolderConfig[]>(INITIAL_DESTINATION_FOLDERS);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  // Sorting and Routing state
  const [sortRule, setSortRule] = useState<FileSortRule>('custom_folders');
  const [userInstructionQuery, setUserInstructionQuery] = useState('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedResults, setOrganizedResults] = useState<OrganizedFileResult[]>([]);
  const [isExecuted, setIsExecuted] = useState(false);
  const [viewTab, setViewTab] = useState<'matrix' | 'buckets' | 'script'>('matrix');

  // Script & Download state
  const [scriptPlatform, setScriptPlatform] = useState<'mac_linux' | 'windows'>('mac_linux');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Ask AI Assistant modal / popup
  const [activeExplainFile, setActiveExplainFile] = useState<OrganizedFileResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploaded = Array.from(e.target.files).map((f) => ({
      id: `up-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      lastModified: f.lastModified,
      fileObj: f,
    }));
    soundFX.playBlip();
    setFiles((prev) => [...uploaded, ...prev]);
    setIsExecuted(false);
  };

  const handleAddCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    soundFX.playBlip();
    const cleanPath = newFolderName.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
    const newFolder: DestinationFolderConfig = {
      id: `df-${Date.now()}`,
      name: cleanPath.split('/').pop() || cleanPath,
      path: cleanPath,
      color: 'yellow',
      description: 'Custom user destination folder',
    };
    setDestinationFolders((prev) => [...prev, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleDeleteFolder = (id: string) => {
    soundFX.playBlip();
    setDestinationFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const runOrganization = async (customPrompt?: string) => {
    soundFX.playSweep();
    setIsOrganizing(true);
    setIsExecuted(false);
    const instruction = customPrompt !== undefined ? customPrompt : userInstructionQuery;

    try {
      const folderPaths = destinationFolders.map((f) => f.path);
      const results = await organizeFilesWithAI(files, sortRule, folderPaths, instruction);
      setOrganizedResults(results);
      soundFX.playSuccess();
    } catch (err) {
      console.error('File organization error:', err);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleManualReassign = (fileId: string, newDestinationPath: string) => {
    soundFX.playBlip();
    setOrganizedResults((prev) =>
      prev.map((item) =>
        item.id === fileId
          ? {
              ...item,
              destinationFolder: newDestinationPath,
              reason: `Manually routed by user to "${newDestinationPath}"`,
            }
          : item
      )
    );
  };

  const executeMoveAction = () => {
    soundFX.playSuccess();
    setIsExecuted(true);
    triggerTaskCompletionEffect();
  };

  const handleDownloadZip = async () => {
    if (organizedResults.length === 0) return;
    soundFX.playBlip();
    setIsDownloadingZip(true);
    try {
      const blob = await createOrganizedZipDownload(files, organizedResults);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Edgerunners_Organized_Desktop_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const generatedScript = generateFileCleanupScript(
    organizedResults.length > 0 ? organizedResults : [],
    scriptPlatform
  );

  const copyScriptToClipboard = () => {
    soundFX.playBlip();
    navigator.clipboard.writeText(generatedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Group files by destinationFolder
  const folderGroups: Record<string, OrganizedFileResult[]> = {};
  organizedResults.forEach((res) => {
    if (!folderGroups[res.destinationFolder]) {
      folderGroups[res.destinationFolder] = [];
    }
    folderGroups[res.destinationFolder].push(res);
  });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || ''))
      return <ImageIcon className="w-4 h-4 text-[#00f0ff]" />;
    if (['ts', 'tsx', 'js', 'py', 'yml', 'json', 'sh'].includes(ext || ''))
      return <FileCode className="w-4 h-4 text-[#fcee0a]" />;
    if (['zip', 'tar', 'gz', 'dmg'].includes(ext || ''))
      return <Archive className="w-4 h-4 text-[#ff0055]" />;
    return <FileText className="w-4 h-4 text-purple-400" />;
  };

  const quickRoutingPrompts = [
    'Where should these files go based on project & type?',
    'Put all contracts into Legal & Contracts and images into Media',
    'Keep code and docker configs together in Code & Scripts',
    'Sort by Last Modified Date into Year/Month subfolders',
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 box-border">
      {/* Hero Studio Banner with Edgerunners Yellow Circuit Accents (Image 1, 2 & 7) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-[#0c0c16] text-white border-2 border-[#fcee0a]/40 shadow-2xl shadow-[#fcee0a]/15 p-4 sm:p-7 box-border"
      >
        {/* Yellow & Cyan glowing accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#fcee0a]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Hazard top border strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fcee0a] via-[#ff0055] to-[#00f0ff]"></div>

        <div className="relative z-10 max-w-full">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full bg-[#fcee0a]/20 text-[#fcee0a] text-xs font-black font-mono flex items-center gap-1.5 border border-[#fcee0a]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#fcee0a]" />
              CYBERPUNK EDGERUNNERS ROUTER
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Night City Desktop Auto-Organizer
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono leading-tight break-words">
            DESKTOP FILE <span className="text-[#fcee0a]">ROUTING MATRIX</span>
          </h2>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl font-mono">
            Ask where your desktop files should go, define custom destination folders, or let AI organize everything automatically.
          </p>

          {/* Natural Language Prompt & Action Bar (Fully Responsive for Mobile/Android) */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2 bg-black/70 backdrop-blur-xl p-2 rounded-2xl border border-[#fcee0a]/30 shadow-lg box-border">
            <div className="flex-1 flex items-center gap-2 px-3 py-1">
              <Sparkles className="w-4 h-4 text-[#fcee0a] shrink-0" />
              <input
                type="text"
                value={userInstructionQuery}
                onChange={(e) => setUserInstructionQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    runOrganization();
                  }
                }}
                placeholder="Ask AI: e.g. 'Put all invoices into Legal and code into Scripts'..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                disabled={isOrganizing}
                onClick={() => runOrganization()}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#fcee0a] hover:bg-[#ffea00] active:scale-95 text-black font-black font-mono rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isOrganizing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
                <span>{isOrganizing ? 'Routing...' : 'Route Files'}</span>
              </button>

              <label className="flex-1 sm:flex-none cursor-pointer px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#fcee0a] border border-[#fcee0a]/30 font-bold font-mono rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Routing Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] uppercase font-bold text-[#fcee0a] font-mono mr-1">
              Quick Ask:
            </span>
            {quickRoutingPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFX.playBlip();
                  setUserInstructionQuery(prompt);
                  runOrganization(prompt);
                }}
                className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-[#fcee0a]/20 text-zinc-300 hover:text-[#fcee0a] border border-zinc-750 hover:border-[#fcee0a]/50 transition-colors font-mono truncate max-w-full"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Destination Folders Management Section (No Overflow on Android) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#0e0e18] border border-[#fcee0a]/25 rounded-2xl p-4 sm:p-5 shadow-xs box-border overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#fcee0a]/20 flex items-center justify-center text-[#fcee0a] shrink-0 border border-[#fcee0a]/40">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2 truncate">
                Available Destination Folders
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-[#fcee0a] font-mono">
                  {destinationFolders.length} FOLDERS
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate">
                Add custom destination paths or click any folder to target specific files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isAddingFolder ? (
              <button
                onClick={() => {
                  soundFX.playBlip();
                  setIsAddingFolder(true);
                }}
                className="px-3 py-1.5 bg-[#fcee0a]/10 hover:bg-[#fcee0a]/20 text-[#fcee0a] border border-[#fcee0a]/40 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Add Folder
              </button>
            ) : (
              <form onSubmit={handleAddCustomFolder} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Projects/Edgerunners"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-black border border-[#fcee0a] rounded-lg px-2.5 py-1 text-xs text-[#fcee0a] font-mono focus:outline-hidden w-36 sm:w-44"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#fcee0a] text-black font-black rounded-lg text-xs font-mono"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingFolder(false)}
                  className="text-xs text-zinc-400 hover:text-white font-mono"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Visual Destination Folder Badges (Responsive 2-col on mobile, up to 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {destinationFolders.map((folder) => {
            const fileCount = organizedResults.filter(
              (r) => r.destinationFolder.toLowerCase() === folder.path.toLowerCase()
            ).length;

            return (
              <motion.div
                key={folder.id}
                whileHover={{ scale: 1.02 }}
                className="group relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-[#fcee0a]/50 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="w-6 h-6 rounded-md bg-[#fcee0a]/20 text-[#fcee0a] flex items-center justify-center">
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 text-xs transition-opacity"
                    title="Remove folder"
                  >
                    &times;
                  </button>
                </div>
                <div className="mt-1.5 min-w-0">
                  <span className="text-[11px] font-bold text-white font-mono truncate block">
                    {folder.name}
                  </span>
                  <span className="text-[9px] text-[#00f0ff] truncate block font-mono">
                    {folder.path}/
                  </span>
                </div>
                <div className="mt-1.5 pt-1 border-t border-zinc-800 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#fcee0a] font-bold">
                    {fileCount} routed
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* View Switcher Bar (Responsive Wrapping) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e0e18] border border-zinc-800 rounded-2xl p-3 box-border">
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1 rounded-xl text-xs font-mono font-bold">
          <button
            onClick={() => {
              soundFX.playBlip();
              setViewTab('matrix');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
              viewTab === 'matrix'
                ? 'bg-[#fcee0a] text-black font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Routing Matrix
          </button>
          <button
            onClick={() => {
              soundFX.playBlip();
              setViewTab('buckets');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
              viewTab === 'buckets'
                ? 'bg-[#fcee0a] text-black font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5" />
            Folder Buckets
          </button>
          <button
            onClick={() => {
              soundFX.playBlip();
              setViewTab('script');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
              viewTab === 'script'
                ? 'bg-[#fcee0a] text-black font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Terminal Script
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {organizedResults.length > 0 && !isExecuted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={executeMoveAction}
              className="px-3.5 py-1.5 bg-[#fcee0a] hover:bg-[#ffea00] text-black rounded-xl text-xs font-black font-mono flex items-center gap-1.5 shadow-md shadow-[#fcee0a]/25 cursor-pointer"
            >
              <FolderCheck className="w-3.5 h-3.5" />
              Apply Organization ({organizedResults.length})
            </motion.button>
          )}

          {isExecuted && (
            <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Executed!
            </span>
          )}

          {organizedResults.length > 0 && (
            <button
              disabled={isDownloadingZip}
              onClick={handleDownloadZip}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[#00f0ff] border border-[#00f0ff]/30 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isDownloadingZip ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              ZIP
            </button>
          )}
        </div>
      </div>

      {/* VIEW TAB 1: File Routing Matrix (Zero Clipping / Overflow) */}
      {viewTab === 'matrix' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0e0e18] border border-zinc-800 rounded-2xl p-4 sm:p-5 box-border overflow-hidden space-y-3"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm font-mono">
                FILE ROUTING MATRIX: WHICH FILE GOES WHERE
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                Change any destination dropdown to reassign where each file is moved
              </p>
            </div>
            <span className="text-[11px] text-[#fcee0a] font-mono">
              {files.length} Files
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80 max-h-[460px] overflow-y-auto overflow-x-hidden pr-1">
            {files.map((file) => {
              const routingInfo = organizedResults.find((r) => r.originalName === file.name || r.id === file.id);
              const currentDest = routingInfo?.destinationFolder || 'Pending Organization...';

              return (
                <motion.div
                  key={file.id}
                  layout
                  className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-900/60 rounded-xl transition-colors box-border"
                >
                  {/* File info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md font-mono">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                        {routingInfo?.reason && (
                          <span className="text-[#fcee0a] italic truncate max-w-[140px] sm:max-w-xs hidden sm:inline">
                            • {routingInfo.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destination Folder Selector */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <div className="flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
                      <select
                        value={currentDest}
                        onChange={(e) => handleManualReassign(file.id, e.target.value)}
                        className="bg-black border border-[#fcee0a]/40 text-[#fcee0a] font-bold font-mono rounded-lg px-2 py-1 text-[11px] focus:outline-hidden max-w-[180px] sm:max-w-[200px] truncate"
                      >
                        <option value={currentDest} disabled>
                          📁 {currentDest}
                        </option>
                        {destinationFolders.map((df) => (
                          <option key={df.id} value={df.path}>
                            📁 {df.path}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        soundFX.playBlip();
                        setActiveExplainFile(routingInfo || {
                          id: file.id,
                          originalName: file.name,
                          size: file.size,
                          lastModified: file.lastModified,
                          destinationFolder: currentDest,
                          suggestedName: file.name,
                          category: 'File',
                          reason: 'Recommended based on filename and extension match.',
                        });
                      }}
                      className="p-1 rounded-lg text-zinc-500 hover:text-[#fcee0a]"
                      title="Why this destination?"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* VIEW TAB 2: Visual Folder Buckets */}
      {viewTab === 'buckets' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {Object.keys(folderGroups).length === 0 ? (
            <div className="bg-[#0e0e18] border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center font-mono">
              <FolderSync className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <h3 className="text-sm font-bold text-white">
                No Folder Buckets Generated Yet
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Click <strong>"Route Files"</strong> at the top to let AI categorize which files go into which folders.
              </p>
              <button
                onClick={() => runOrganization()}
                className="mt-3 px-4 py-2 bg-[#fcee0a] text-black font-black rounded-xl text-xs"
              >
                Run AI Auto-Routing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(folderGroups).map(([folderPath, groupFiles]) => (
                <motion.div
                  key={folderPath}
                  layout
                  className="bg-[#0e0e18] border border-zinc-800 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Folder className="w-4 h-4 text-[#fcee0a] shrink-0" />
                        <h4 className="font-bold text-xs text-white font-mono truncate">
                          {folderPath}/
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fcee0a]/20 text-[#fcee0a] font-mono shrink-0">
                        {groupFiles.length} files
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {groupFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/60 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(f.originalName)}
                            <span className="text-zinc-200 font-medium truncate max-w-[140px] sm:max-w-[180px]">
                              {f.originalName}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-400 shrink-0">
                            {formatBytes(f.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Target Folder</span>
                    <span className="font-bold text-[#fcee0a]">
                      {formatBytes(groupFiles.reduce((acc, f) => acc + f.size, 0))}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW TAB 3: Terminal Script & ZIP Export */}
      {viewTab === 'script' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-black text-white rounded-3xl p-4 sm:p-7 border border-[#fcee0a]/40 shadow-2xl space-y-3 box-border overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#fcee0a]/20 text-[#fcee0a] flex items-center justify-center font-black">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white font-mono">
                  LOCAL OS EXECUTION SCRIPT
                </h4>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                  Run inside terminal to automatically move and organize your desktop files.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold">
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setScriptPlatform('mac_linux');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    scriptPlatform === 'mac_linux'
                      ? 'bg-[#fcee0a] text-black font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  macOS / Linux (.sh)
                </button>
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setScriptPlatform('windows');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    scriptPlatform === 'windows'
                      ? 'bg-[#fcee0a] text-black font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Windows (.bat)
                </button>
              </div>

              <button
                onClick={copyScriptToClipboard}
                className="px-3 py-1.5 bg-[#fcee0a] hover:bg-[#ffea00] text-black font-black font-mono rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedScript ? (
                  <Check className="w-3.5 h-3.5 text-black" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedScript ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
          </div>

          <pre className="p-3 sm:p-4 rounded-2xl bg-zinc-950 font-mono text-[11px] text-[#fcee0a] border border-zinc-800 overflow-x-auto max-h-52 break-all sm:break-normal whitespace-pre-wrap">
            {generatedScript}
          </pre>
        </motion.div>
      )}

      {/* AI Explanation Modal */}
      <AnimatePresence>
        {activeExplainFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e0e18] border border-[#fcee0a]/50 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-3 font-mono"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#fcee0a]" />
                  <h4 className="font-bold text-xs sm:text-sm text-white">
                    AI ROUTING REASONING
                  </h4>
                </div>
                <button
                  onClick={() => setActiveExplainFile(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-400 text-[10px]">FILE:</span>
                  <p className="font-bold text-white truncate mt-0.5">
                    {activeExplainFile.originalName}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px]">TARGET DESTINATION:</span>
                  <p className="font-bold text-[#fcee0a] mt-0.5 flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5" />
                    {activeExplainFile.destinationFolder}/
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px]">REASONING:</span>
                  <p className="text-zinc-300 mt-0.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 leading-relaxed italic text-[11px]">
                    "{activeExplainFile.reason}"
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveExplainFile(null)}
                  className="px-4 py-1.5 bg-[#fcee0a] text-black font-black text-xs rounded-xl"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
