// File System Access API utility for PWA backup system

const DB_NAME = 'chrono-backup-db';
const DB_VERSION = 1;
const STORE_NAME = 'directory-handle';

export type OS = 'macos' | 'windows' | 'linux' | 'unknown';

export interface BackupConfig {
  directoryHandle: FileSystemDirectoryHandle | null;
  path: string;
  os: OS;
}

// Detect operating system
export function detectOS(): OS {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'macos';
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }
  return 'unknown';
}

// Get default Downloads path based on OS
export function getDefaultDownloadsPath(os: OS): string {
  switch (os) {
    case 'macos':
      return '~/Downloads';
    case 'windows':
      return 'C:\\Users\\User\\Downloads';
    case 'linux':
      return '~/Downloads';
    default:
      return 'Downloads';
  }
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window && 'FileSystemHandle' in window;
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save directory handle to IndexedDB
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle | null): Promise<void> {
  if (!isFileSystemAccessSupported()) return;
  
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      if (handle) {
        const request = store.put(handle, 'directory-handle');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } else {
        const request = store.delete('directory-handle');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }
    });
  } catch (error) {
    console.error('Failed to save directory handle:', error);
    throw error;
  }
}

// Load directory handle from IndexedDB
export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) return null;
  
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('directory-handle');
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const handle = request.result;
        resolve(handle || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to load directory handle:', error);
    return null;
  }
}

// Verify directory handle permission
export async function verifyPermission(
  handle: FileSystemDirectoryHandle,
  mode: FileSystemPermissionMode = 'readwrite'
): Promise<boolean> {
  try {
    // Check if we already have permission
    const permissionStatus = await handle.queryPermission({ mode });
    if (permissionStatus === 'granted') {
      return true;
    }
    
    // Request permission if not granted
    if (permissionStatus === 'prompt') {
      const newPermission = await handle.requestPermission({ mode });
      return newPermission === 'granted';
    }
    
    return false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Get directory name from handle
export async function getDirectoryName(handle: FileSystemDirectoryHandle | null): Promise<string> {
  if (!handle) return '';
  
  try {
    // Try to get the name from the handle
    if ('name' in handle) {
      return handle.name;
    }
    // Fallback: try to get it from the path
    return 'Selected Folder';
  } catch {
    return 'Selected Folder';
  }
}

// Select directory using File System Access API
export async function selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported');
  }
  
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });
    
    // Verify permission
    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
    
    // Save handle to IndexedDB
    await saveDirectoryHandle(handle);
    
    return handle;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled
      return null;
    }
    throw error;
  }
}

// Save backup file to selected directory
export async function saveBackupFile(
  directoryHandle: FileSystemDirectoryHandle,
  data: string,
  filename: string = 'backup.json'
): Promise<void> {
  try {
    // Verify permission
    const hasPermission = await verifyPermission(directoryHandle);
    if (!hasPermission) {
      throw new Error('Permission denied. Please select the folder again.');
    }
    
    // Get or create file handle
    let fileHandle: FileSystemFileHandle;
    try {
      // Try to get existing file
      fileHandle = await directoryHandle.getFileHandle(filename, { create: false });
    } catch {
      // File doesn't exist, create it
      fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
    }
    
    // Create writable stream
    const writable = await fileHandle.createWritable();
    
    // Seek to beginning and truncate to ensure we overwrite
    await writable.seek(0);
    await writable.truncate(0);
    
    // Write data (this will overwrite the entire file)
    await writable.write(data);
    
    // Close the file
    await writable.close();
  } catch (error) {
    console.error('Failed to save backup file:', error);
    throw error;
  }
}

// Fallback: Download file (for unsupported browsers)
export function downloadBackupFile(data: string, filename: string = 'backup.json'): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Get current backup configuration
export async function getBackupConfig(): Promise<BackupConfig> {
  const os = detectOS();
  const defaultPath = getDefaultDownloadsPath(os);
  const directoryHandle = await loadDirectoryHandle();
  
  let path = defaultPath;
  if (directoryHandle) {
    try {
      const name = await getDirectoryName(directoryHandle);
      path = name || defaultPath;
    } catch {
      path = defaultPath;
    }
  }
  
  return {
    directoryHandle,
    path,
    os,
  };
}

// Reset to default Downloads path
export async function resetToDefaultPath(): Promise<void> {
  await saveDirectoryHandle(null);
}

