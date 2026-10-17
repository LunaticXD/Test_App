import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory Cloud Storage Vault for multi-device sync
interface CloudTask {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  source?: 'manual' | 'drop_window' | 'vscode' | 'claude' | 'git' | 'gmail' | 'classroom';
  sourceDetails?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

let cloudVaultTasks: Record<string, CloudTask> = {};
let cloudVaultLastSync = Date.now();

// AI Task Categorization Endpoint
app.post('/api/categorize-task', async (req, res) => {
  const { text, existingProjects = [] } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Task text is required' });
  }

  // Fallback heuristic if API key is not configured or errors
  const fallbackCategorization = (rawText: string) => {
    const lower = rawText.toLowerCase();
    let priority: 'Urgent' | 'High' | 'Medium' | 'Low' = 'Medium';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('crit') || lower.includes('broken') || lower.includes('crash')) {
      priority = 'Urgent';
    } else if (lower.includes('important') || lower.includes('high') || lower.includes('fix') || lower.includes('bug')) {
      priority = 'High';
    } else if (lower.includes('low') || lower.includes('someday') || lower.includes('nice to have')) {
      priority = 'Low';
    }

    let project = 'General';
    if (lower.includes('react') || lower.includes('ui') || lower.includes('css') || lower.includes('frontend') || lower.includes('button')) {
      project = 'Frontend';
    } else if (lower.includes('server') || lower.includes('api') || lower.includes('database') || lower.includes('backend') || lower.includes('sql')) {
      project = 'Backend & API';
    } else if (lower.includes('git') || lower.includes('pr') || lower.includes('repo') || lower.includes('deploy') || lower.includes('docker')) {
      project = 'DevOps & Git';
    } else if (lower.includes('homework') || lower.includes('assignment') || lower.includes('class') || lower.includes('exam') || lower.includes('classroom')) {
      project = 'Classroom / Study';
    } else if (lower.includes('mail') || lower.includes('client') || lower.includes('reply') || lower.includes('meeting')) {
      project = 'Client & Mail';
    } else if (existingProjects.length > 0) {
      project = existingProjects[0];
    }

    return {
      title: rawText.length > 60 ? rawText.slice(0, 57) + '...' : rawText,
      description: rawText,
      project,
      priority,
      estimatedMinutes: 30,
      tags: [project.toLowerCase().replace(/[^a-z0-9]/g, '-'), priority.toLowerCase()],
      suggestedSubtasks: ['Review requirements', 'Execute implementation', 'Verify completion'],
      reasoning: `Categorized as ${project} (${priority} priority) based on keyword matching: "${rawText.slice(0, 30)}..."`,
    };
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(fallbackCategorization(text));
    }

    const prompt = `Analyze this dropped task or note: "${text}".
Existing project categories in user's workspace: ${existingProjects.join(', ') || 'Frontend, Backend, DevOps, Classroom, Design, Personal'}.

Infer:
1. title: Crisp, active-verb title (e.g., "Fix auth token refresh bug")
2. description: Useful extracted context or full note
3. project: Best category (match existing ones if appropriate or create a concise new one)
4. priority: Exactly one of "Urgent", "High", "Medium", "Low"
5. estimatedMinutes: Reasonable estimated duration in minutes
6. tags: 2 to 4 concise tags
7. suggestedSubtasks: 2 to 4 actionable sub-steps
8. reasoning: 1 concise sentence explaining why this priority and project were assigned.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            project: { type: Type.STRING },
            priority: {
              type: Type.STRING,
              enum: ['Urgent', 'High', 'Medium', 'Low'],
            },
            estimatedMinutes: { type: Type.INTEGER },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedSubtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reasoning: { type: Type.STRING },
          },
          required: ['title', 'project', 'priority', 'tags', 'reasoning'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini categorization error, falling back:', err?.message);
    return res.json(fallbackCategorization(text));
  }
});

// AI Desktop File Organization Planner Endpoint
app.post('/api/organize-files', async (req, res) => {
  const { files = [], mode = 'type_and_date', customFolders = [], userInstructions = '' } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided for organization' });
  }

  // Fallback organizer
  const fallbackOrganize = (items: any[]) => {
    return items.map((file) => {
      const ext = (file.name.split('.').pop() || 'other').toLowerCase();
      const date = new Date(file.lastModified || Date.now());
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      let typeCategory = 'Documents';
      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'screenshot'].includes(ext)) {
        typeCategory = 'Images & Media';
      } else if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'html', 'css', 'go', 'rs'].includes(ext)) {
        typeCategory = 'Code & Scripts';
      } else if (['zip', 'tar', 'gz', 'dmg', 'exe', 'pkg'].includes(ext)) {
        typeCategory = 'Archives & Installers';
      } else if (['csv', 'xlsx', 'xls', 'parquet'].includes(ext)) {
        typeCategory = 'Data & Spreadsheets';
      } else if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) {
        typeCategory = 'Documents & Notes';
      }

      let destinationFolder = '';
      if (customFolders && customFolders.length > 0) {
        // Match closest custom folder
        const lowerName = file.name.toLowerCase();
        const matched = customFolders.find((cf: string) => {
          const lcf = cf.toLowerCase();
          return lowerName.includes(lcf) || typeCategory.toLowerCase().includes(lcf);
        });
        destinationFolder = matched || customFolders[0];
      } else if (mode === 'type_and_date') {
        destinationFolder = `${typeCategory}/${monthYear}`;
      } else if (mode === 'type') {
        destinationFolder = typeCategory;
      } else if (mode === 'date') {
        destinationFolder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        destinationFolder = `${typeCategory}/${monthYear}`;
      }

      return {
        id: file.id || Math.random().toString(36).substring(7),
        originalName: file.name,
        size: file.size,
        lastModified: file.lastModified,
        destinationFolder,
        suggestedName: file.name,
        category: typeCategory,
        reason: userInstructions
          ? `Routed based on custom instruction: "${userInstructions.slice(0, 35)}..."`
          : `Sorted by ${mode}: ${ext.toUpperCase()} file from ${monthYear}`,
      };
    });
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ organizedFiles: fallbackOrganize(files) });
    }

    const fileSample = files.slice(0, 30).map((f: any) => ({
      name: f.name,
      size: f.size,
      lastModified: new Date(f.lastModified).toISOString().split('T')[0],
    }));

    const availableFoldersText = customFolders.length > 0
      ? `Preferred destination folders available: ${customFolders.join(', ')}`
      : `Generate clean hierarchical destination folders like "Documents/2026-10", "Images & Media", "Code/TypeScript", "Legal & Contracts"`;

    const instructionsText = userInstructions
      ? `Specific user routing instruction: "${userInstructions}"`
      : `Default routing strategy: ${mode} (organize based on file type and last modified date)`;

    const prompt = `You are an automated Desktop File Organization AI.
Analyze these desktop files and determine exactly WHICH files should go WHERE.
${availableFoldersText}
${instructionsText}
Files to sort: ${JSON.stringify(fileSample)}

For each file:
- assign the most logical destinationFolder (either one of the user's preferred folders or an intuitive new folder)
- assign category
- suggest cleaned-up suggestedName if beneficial (or keep originalName)
- provide a clear, concise reason explaining why this file belongs in this destination folder.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            organizedFiles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalName: { type: Type.STRING },
                  destinationFolder: { type: Type.STRING },
                  category: { type: Type.STRING },
                  suggestedName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['originalName', 'destinationFolder', 'category'],
              },
            },
          },
          required: ['organizedFiles'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    // Match back with file objects
    const result = (parsed.organizedFiles || []).map((item: any, idx: number) => {
      const original = files.find((f: any) => f.name === item.originalName) || files[idx] || {};
      return {
        id: original.id || Math.random().toString(36).substring(7),
        originalName: item.originalName || original.name,
        size: original.size || 1024,
        lastModified: original.lastModified || Date.now(),
        destinationFolder: item.destinationFolder || 'Organized',
        suggestedName: item.suggestedName || original.name,
        category: item.category || 'General',
        reason: item.reason || 'Auto-categorized',
      };
    });

    return res.json({ organizedFiles: result });
  } catch (err: any) {
    console.error('File organization AI error, falling back:', err?.message);
    return res.json({ organizedFiles: fallbackOrganize(files) });
  }
});

// Cloud Storage Sync Vault Endpoint (Simulates cross-device Android <-> Desktop sync)
app.get('/api/cloud-sync', (_req, res) => {
  res.json({
    tasks: Object.values(cloudVaultTasks),
    lastSync: cloudVaultLastSync,
    status: 'connected',
    serverTimestamp: Date.now(),
    deviceCount: 3, // Desktop (Active), Pixel 9 Pro (Synced 2m ago), Web (Synced now)
  });
});

app.post('/api/cloud-sync', (req, res) => {
  const { tasks = [], clientLastSync = 0, deviceName = 'Client' } = req.body;

  // Merge with last-write-wins
  tasks.forEach((clientTask: CloudTask) => {
    const existing = cloudVaultTasks[clientTask.id];
    if (!existing || clientTask.updatedAt >= existing.updatedAt) {
      cloudVaultTasks[clientTask.id] = clientTask;
    }
  });

  cloudVaultLastSync = Date.now();

  res.json({
    success: true,
    serverTasks: Object.values(cloudVaultTasks),
    syncedAt: cloudVaultLastSync,
    message: `Synchronized ${tasks.length} tasks with cloud vault from ${deviceName}`,
  });
});

// App Connectors: Simulated real integrations
app.post('/api/app-connectors/import', (req, res) => {
  const { app: appName } = req.body;

  const sampleImports: Record<string, CloudTask[]> = {
    vscode: [
      {
        id: `vscode-${Date.now()}-1`,
        title: 'Fix memory leak in WebSocket connection pool',
        description: 'TODO found in src/network/socket_pool.ts:42 - ensure cleanup on window blur',
        project: 'Backend & API',
        priority: 'High',
        status: 'todo',
        tags: ['vscode', 'todo-comment', 'memory'],
        subtasks: [
          { id: '1', title: 'Inspect socket lifecycle hook', completed: false },
          { id: '2', title: 'Add unit test for rapid reconnects', completed: false },
        ],
        source: 'vscode',
        sourceDetails: 'src/network/socket_pool.ts (Line 42)',
        createdAt: Date.now() - 1000 * 60 * 30,
        updatedAt: Date.now(),
      },
      {
        id: `vscode-${Date.now()}-2`,
        title: 'Review uncommitted changes in git status',
        description: 'Workspace has 3 modified files in branch feature/task-sync',
        project: 'DevOps & Git',
        priority: 'Medium',
        status: 'in_progress',
        tags: ['vscode', 'git-diff'],
        subtasks: [
          { id: '1', title: 'Run linter across changed files', completed: true },
          { id: '2', title: 'Commit with conventional commit format', completed: false },
        ],
        source: 'vscode',
        sourceDetails: 'VS Code Git Extension (Branch: feature/task-sync)',
        createdAt: Date.now() - 1000 * 60 * 60,
        updatedAt: Date.now(),
      },
    ],
    claude: [
      {
        id: `claude-${Date.now()}-1`,
        title: 'Implement token bucket rate limiter for API gateway',
        description: 'Action item extracted from Claude architecture discussion: "Add a sliding window rate limiter to protect authentication endpoints"',
        project: 'Backend & API',
        priority: 'Urgent',
        status: 'todo',
        tags: ['claude', 'architecture', 'security'],
        subtasks: [
          { id: '1', title: 'Evaluate Redis vs local memory bucket', completed: false },
          { id: '2', title: 'Define burst limit and replenish rates', completed: false },
          { id: '3', title: 'Add 429 Too Many Requests response handler', completed: false },
        ],
        source: 'claude',
        sourceDetails: 'Conversation: "Distributed Rate Limiter Design" (Turn 6)',
        createdAt: Date.now() - 1000 * 60 * 90,
        updatedAt: Date.now(),
      },
    ],
    git: [
      {
        id: `git-${Date.now()}-1`,
        title: 'Review PR #142: Add offline IndexedDB caching layer',
        description: 'Requested reviewer on origin/main PR #142 by @alex-dev. 14 files changed, +420 -80 lines.',
        project: 'Frontend',
        priority: 'High',
        status: 'todo',
        tags: ['git', 'pr-review', 'github'],
        subtasks: [
          { id: '1', title: 'Check fallback behavior in Safari private mode', completed: false },
          { id: '2', title: 'Verify IndexedDB upgrade migration path', completed: false },
          { id: '3', title: 'Approve or leave review comments', completed: false },
        ],
        source: 'git',
        sourceDetails: 'GitHub Repo: org/taskorbit-core (PR #142)',
        createdAt: Date.now() - 1000 * 60 * 120,
        updatedAt: Date.now(),
      },
    ],
    gmail: [
      {
        id: `gmail-${Date.now()}-1`,
        title: 'Reply to Client regarding Q4 Deliverables contract',
        description: 'Flagged email from sarah.miller@enterprise.io: "Need signed amendment by Monday 5pm for cloud infrastructure extension"',
        project: 'Client & Mail',
        priority: 'Urgent',
        status: 'todo',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        tags: ['gmail', 'action-required', 'client'],
        subtasks: [
          { id: '1', title: 'Review Exhibit B pricing clause', completed: false },
          { id: '2', title: 'Send digital signature confirmation', completed: false },
        ],
        source: 'gmail',
        sourceDetails: 'Gmail Thread: [Contract] Q4 Cloud Extension Amendment',
        createdAt: Date.now() - 1000 * 60 * 45,
        updatedAt: Date.now(),
      },
    ],
    classroom: [
      {
        id: `classroom-${Date.now()}-1`,
        title: 'Distributed Systems: Lab 3 Raft Consensus Implementation',
        description: 'Assignment from CS 448 (Prof. Zhang): Submit raft leader election and log replication test suites.',
        project: 'Classroom / Study',
        priority: 'High',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        tags: ['classroom', 'assignment', 'cs448'],
        subtasks: [
          { id: '1', title: 'Pass 2A election tests', completed: true },
          { id: '2', title: 'Pass 2B log replication tests', completed: false },
          { id: '3', title: 'Submit code and benchmark PDF to Classroom portal', completed: false },
        ],
        source: 'classroom',
        sourceDetails: 'Google Classroom: CS 448 Distributed Systems - Fall 2026',
        createdAt: Date.now() - 1000 * 60 * 180,
        updatedAt: Date.now(),
      },
    ],
  };

  const tasksToImport = sampleImports[appName] || [];
  return res.json({
    success: true,
    importedCount: tasksToImport.length,
    tasks: tasksToImport,
  });
});

async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskOrbit server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
