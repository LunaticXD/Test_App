import JSZip from 'jszip';
import { DesktopFile, FileSortRule, OrganizedFileResult, Priority } from '../types';

export interface CategorizedTaskResult {
  title: string;
  description: string;
  project: string;
  priority: Priority;
  estimatedMinutes: number;
  tags: string[];
  suggestedSubtasks: string[];
  reasoning: string;
}

export async function categorizeTaskWithAI(
  text: string,
  existingProjects: string[] = []
): Promise<CategorizedTaskResult> {
  try {
    const res = await fetch('/api/categorize-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, existingProjects }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('AI categorization backend unavailable, using client-side inference:', err);
    return localCategorizeFallback(text, existingProjects);
  }
}

function localCategorizeFallback(rawText: string, existingProjects: string[]): CategorizedTaskResult {
  const lower = rawText.toLowerCase();

  let priority: Priority = 'Medium';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('blocker') || lower.includes('crash')) {
    priority = 'Urgent';
  } else if (lower.includes('important') || lower.includes('high') || lower.includes('bug') || lower.includes('fix') || lower.includes('pr')) {
    priority = 'High';
  } else if (lower.includes('low') || lower.includes('someday') || lower.includes('clean') || lower.includes('chore')) {
    priority = 'Low';
  }

  let project = 'Personal';
  if (lower.includes('css') || lower.includes('ui') || lower.includes('button') || lower.includes('frontend') || lower.includes('react') || lower.includes('view')) {
    project = 'Frontend';
  } else if (lower.includes('api') || lower.includes('server') || lower.includes('database') || lower.includes('endpoint') || lower.includes('auth') || lower.includes('backend')) {
    project = 'Backend & API';
  } else if (lower.includes('git') || lower.includes('pr') || lower.includes('branch') || lower.includes('ci') || lower.includes('deploy') || lower.includes('docker')) {
    project = 'DevOps & Git';
  } else if (lower.includes('class') || lower.includes('assignment') || lower.includes('homework') || lower.includes('lab') || lower.includes('cs') || lower.includes('exam')) {
    project = 'Classroom / Study';
  } else if (lower.includes('mail') || lower.includes('reply') || lower.includes('client') || lower.includes('contract') || lower.includes('invoice')) {
    project = 'Client & Mail';
  } else if (existingProjects.length > 0) {
    project = existingProjects[0];
  }

  return {
    title: rawText.length > 55 ? rawText.slice(0, 52) + '...' : rawText,
    description: rawText,
    project,
    priority,
    estimatedMinutes: 30,
    tags: [project.toLowerCase().replace(/[^a-z0-9]/g, '-'), priority.toLowerCase()],
    suggestedSubtasks: [
      'Define clear acceptance criteria',
      'Execute task implementation',
      'Verify test cases & complete',
    ],
    reasoning: `Inferred ${project} (${priority} priority) from context keywords in: "${rawText.slice(0, 30)}"`,
  };
}

export async function organizeFilesWithAI(
  files: DesktopFile[],
  mode: FileSortRule,
  customFolders: string[] = [],
  userInstructions: string = ''
): Promise<OrganizedFileResult[]> {
  try {
    const payload = files.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
    }));

    const res = await fetch('/api/organize-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: payload, mode, customFolders, userInstructions }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.organizedFiles || [];
  } catch (err) {
    console.warn('Backend file organizer unavailable, applying local categorization rule:', err);
    return localOrganizeFallback(files, mode, customFolders, userInstructions);
  }
}

function localOrganizeFallback(
  files: DesktopFile[],
  mode: FileSortRule,
  customFolders: string[] = [],
  userInstructions: string = ''
): OrganizedFileResult[] {
  return files.map((file) => {
    const ext = (file.name.split('.').pop() || 'file').toLowerCase();
    const date = new Date(file.lastModified);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    let category = 'Documents';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'mov'].includes(ext)) {
      category = 'Media & Screenshots';
    } else if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'html', 'css', 'go', 'rs', 'sh'].includes(ext)) {
      category = 'Code & Scripts';
    } else if (['zip', 'tar', 'gz', 'dmg', 'exe', 'iso', 'pkg'].includes(ext)) {
      category = 'Archives & Installers';
    } else if (['csv', 'xlsx', 'xls', 'parquet', 'db'].includes(ext)) {
      category = 'Data & Spreadsheets';
    } else if (['pdf', 'docx', 'doc', 'txt', 'md', 'pptx'].includes(ext)) {
      category = 'Documents & Notes';
    }

    let destinationFolder = '';
    if (customFolders && customFolders.length > 0) {
      const lowerName = file.name.toLowerCase();
      const matched = customFolders.find((cf) => {
        const lcf = cf.toLowerCase();
        return lowerName.includes(lcf) || category.toLowerCase().includes(lcf);
      });
      destinationFolder = matched || customFolders[0];
    } else if (mode === 'type_and_date') {
      destinationFolder = `${category}/${monthYear}`;
    } else if (mode === 'type') {
      destinationFolder = category;
    } else if (mode === 'date') {
      destinationFolder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      destinationFolder = `${category}/${monthYear}`;
    }

    return {
      id: file.id,
      originalName: file.name,
      size: file.size,
      lastModified: file.lastModified,
      destinationFolder,
      suggestedName: file.name,
      category,
      reason: userInstructions
        ? `Matched based on instruction: "${userInstructions.slice(0, 30)}..."`
        : `Sorted by ${mode}: ${ext.toUpperCase()} from ${monthYear}`,
    };
  });
}

export function generateFileCleanupScript(
  organizedFiles: OrganizedFileResult[],
  platform: 'mac_linux' | 'windows'
): string {
  if (platform === 'windows') {
    let script = `@echo off\nREM TaskOrbit Desktop Organizer Script (PowerShell / Batch)\nREM Run in PowerShell or Command Prompt from your Desktop folder\n\n`;
    const folders = Array.from(new Set(organizedFiles.map((f) => f.destinationFolder.replace(/\//g, '\\'))));
    folders.forEach((folder) => {
      script += `if not exist "${folder}" mkdir "${folder}"\n`;
    });
    script += `\nREM Moving organized files\n`;
    organizedFiles.forEach((f) => {
      const dest = f.destinationFolder.replace(/\//g, '\\');
      script += `if exist "${f.originalName}" move "${f.originalName}" "${dest}\\" >nul\n`;
    });
    script += `\necho Desktop organization complete!\npause\n`;
    return script;
  } else {
    let script = `#!/usr/bin/env bash\n# TaskOrbit Desktop Organizer Script for macOS & Linux\n# Run inside ~/Desktop\n\nset -e\ncd ~/Desktop\necho "Organizing Desktop files with TaskOrbit..."\n\n`;
    const folders = Array.from(new Set(organizedFiles.map((f) => f.destinationFolder)));
    folders.forEach((folder) => {
      script += `mkdir -p "${folder}"\n`;
    });
    script += `\n# Move categorized files\n`;
    organizedFiles.forEach((f) => {
      script += `if [ -f "${f.originalName}" ]; then\n  mv "${f.originalName}" "${f.destinationFolder}/"\nfi\n`;
    });
    script += `\necho "Done! All files sorted into categorized folders."\n`;
    return script;
  }
}

export async function createOrganizedZipDownload(
  files: DesktopFile[],
  organizedResults: OrganizedFileResult[]
): Promise<Blob> {
  const zip = new JSZip();

  for (const org of organizedResults) {
    const original = files.find((f) => f.name === org.originalName || f.id === org.id);
    const folderPath = org.destinationFolder;
    const fileName = org.suggestedName || org.originalName;

    if (original?.fileObj) {
      zip.folder(folderPath)?.file(fileName, original.fileObj);
    } else {
      // For simulated/demo files, create a placeholder text file indicating organization
      const content = `File: ${org.originalName}\nCategory: ${org.category}\nOrganized by TaskOrbit AI\nTimestamp: ${new Date(org.lastModified).toISOString()}\nSorting Reason: ${org.reason}`;
      zip.folder(folderPath)?.file(fileName, content);
    }
  }

  // Also include a manifest summary inside the zip
  const manifest = {
    organizedAt: new Date().toISOString(),
    totalFiles: organizedResults.length,
    structure: organizedResults.map((r) => ({
      file: r.originalName,
      folder: r.destinationFolder,
      category: r.category,
      reason: r.reason,
    })),
  };
  zip.file('DESKTOP_ORGANIZATION_SUMMARY.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}
