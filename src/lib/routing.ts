// Shared, dependency-free file routing heuristics.
// Used by the Express fallback (server.ts), the client fallback (gemini.ts) and the HUD window,
// so all three route files the same way when the Gemini API is unavailable.

export type FileKind = 'legal' | 'media' | 'code' | 'data' | 'classroom' | 'archive' | 'document';

const EXTENSIONS: Record<string, FileKind> = {
  // media
  png: 'media', jpg: 'media', jpeg: 'media', gif: 'media', svg: 'media', webp: 'media', heic: 'media',
  mp4: 'media', mov: 'media', mp3: 'media', wav: 'media', psd: 'media', fig: 'media',
  // code
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', json: 'code', py: 'code', html: 'code', css: 'code',
  go: 'code', rs: 'code', java: 'code', c: 'code', cpp: 'code', sh: 'code', yml: 'code', yaml: 'code',
  toml: 'code', sql: 'code',
  // data
  csv: 'data', xlsx: 'data', xls: 'data', parquet: 'data', tsv: 'data', db: 'data', ods: 'data',
  // archives
  zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive', '7z': 'archive', dmg: 'archive',
  exe: 'archive', pkg: 'archive', iso: 'archive',
  // documents
  pdf: 'document', docx: 'document', doc: 'document', txt: 'document', md: 'document',
  pptx: 'document', rtf: 'document', odt: 'document',
};

// Filename words that override the extension (a "contract.pdf" is legal, not just a document)
const NAME_HINTS: Array<[RegExp, FileKind]> = [
  [/\b(invoice|contract|nda|sla|agreement|legal|proposal|terms|liability)\b/, 'legal'],
  [/\b(lab|assignment|homework|coursework|lecture|syllabus|exam|classroom|study|raft|cs\d{2,3})\b/, 'classroom'],
  [/\b(screenshot|screen shot|banner|mockup|wallpaper|photo)\b/, 'media'],
  [/\b(backup|archive|installer|snapshot)\b/, 'archive'],
];

// Words that identify a destination folder for each kind
const FOLDER_KEYWORDS: Record<FileKind, string[]> = {
  legal: ['legal', 'contract', 'client', 'nda'],
  media: ['media', 'screenshot', 'image', 'visual', 'photo', 'picture'],
  code: ['code', 'script', 'source', 'dev'],
  data: ['data', 'spreadsheet', 'financ', 'sheet', 'report'],
  classroom: ['class', 'study', 'academic', 'course', 'school', 'lecture'],
  archive: ['archive', 'backup', 'installer'],
  document: ['document', 'notes', 'paper', 'docs'],
};

export const KIND_LABELS: Record<FileKind, string> = {
  legal: 'Legal & Contracts',
  media: 'Media & Screenshots',
  code: 'Code & Scripts',
  data: 'Data & Spreadsheets',
  classroom: 'Classroom / Study',
  archive: 'Archives & Installers',
  document: 'Documents & Notes',
};

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx > -1 ? fileName.slice(idx + 1).toLowerCase() : '';
}

/** Classify a file from its name (name hints first, then its extension). */
export function classifyFile(fileName: string): FileKind {
  const words = fileName.toLowerCase().replace(/[_\-.]+/g, ' ');
  for (const [pattern, kind] of NAME_HINTS) {
    if (pattern.test(words)) return kind;
  }
  return EXTENSIONS[getExtension(fileName)] ?? 'document';
}

/**
 * Pick the best destination among `folders` for a file, or `null` if none of the folders
 * looks like a match (callers decide what "unsorted" means).
 */
export function pickFolderForFile(fileName: string, folders: string[]): string | null {
  if (folders.length === 0) return null;
  const lowerName = fileName.toLowerCase();

  // 1. A folder whose own name appears in the filename wins ("Legal" in "Legal_Review.pdf")
  const byName = folders.find((f) => {
    const leaf = f.toLowerCase().split('/').pop() ?? '';
    return leaf.length > 3 && lowerName.includes(leaf);
  });
  if (byName) return byName;

  // 2. Otherwise match the file's kind against each folder's keywords
  const kind = classifyFile(fileName);
  const byKind = folders.find((f) => {
    const lf = f.toLowerCase();
    return FOLDER_KEYWORDS[kind].some((kw) => lf.includes(kw));
  });
  return byKind ?? null;
}

/** True if free text looks like a file name ("report.pdf", "main.ts") rather than a task sentence. */
export function looksLikeFileName(text: string): boolean {
  return /^\S+\.[a-z0-9]{1,5}$/i.test(text.trim()) && EXTENSIONS[getExtension(text.trim())] !== undefined;
}
