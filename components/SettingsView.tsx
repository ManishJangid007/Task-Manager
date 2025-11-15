import React, { useRef, useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, FolderIcon } from './Icons';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { ProjectSortOrder } from '../types';
import {
  isFileSystemAccessSupported,
  selectDirectory,
  getBackupConfig,
  resetToDefaultPath,
  getDefaultDownloadsPath,
  type BackupConfig
} from '../utils/fileSystemAccess';

interface SettingsViewProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  includeCompletedTasks: boolean;
  onIncludeCompletedTasksChange: (value: boolean) => void;
  projectSortOrder: ProjectSortOrder;
  onProjectSortOrderChange: (value: ProjectSortOrder) => void;
  askForTaskDeleteConfirmation: boolean;
  onAskForTaskDeleteConfirmationChange: (value: boolean) => void;
  defaultIncludeDateInCopy: boolean;
  onDefaultIncludeDateInCopyChange: (value: boolean) => void;
  onBackupConfigChange: (config: BackupConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  onExport,
  onImport,
  includeCompletedTasks,
  onIncludeCompletedTasksChange,
  projectSortOrder,
  onProjectSortOrderChange,
  askForTaskDeleteConfirmation,
  onAskForTaskDeleteConfirmationChange,
  defaultIncludeDateInCopy,
  onDefaultIncludeDateInCopyChange,
  onBackupConfigChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupConfig, setBackupConfig] = useState<BackupConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const fileSystemSupported = isFileSystemAccessSupported();

  useEffect(() => {
    loadBackupConfig();
  }, []);

  const loadBackupConfig = async () => {
    try {
      const config = await getBackupConfig();
      setBackupConfig(config);
      onBackupConfigChange(config);
    } catch (error) {
      console.error('Failed to load backup config:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectFolder = async () => {
    if (!fileSystemSupported) return;

    setIsSelectingFolder(true);
    try {
      const handle = await selectDirectory();
      if (handle) {
        const config = await getBackupConfig();
        setBackupConfig(config);
        onBackupConfigChange(config);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      alert('Failed to select folder. Please try again.');
    } finally {
      setIsSelectingFolder(false);
    }
  };

  const handleResetPath = async () => {
    try {
      await resetToDefaultPath();
      const config = await getBackupConfig();
      setBackupConfig(config);
      onBackupConfigChange(config);
    } catch (error) {
      console.error('Failed to reset path:', error);
      alert('Failed to reset path. Please try again.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h2>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Sidebar Preferences</h3>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="include-completed" className="text-sm font-medium text-foreground">
                  Include completed tasks in sidebar counts
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, sidebar task counts include all tasks. When disabled, only incomplete tasks are counted.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  id="include-completed"
                  checked={includeCompletedTasks}
                  onCheckedChange={onIncludeCompletedTasksChange}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="project-sort" className="text-sm font-medium text-foreground">
                  How to sort projects
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose how projects are sorted in the sidebar. Pinned projects always appear first.
                </p>
              </div>
              <div className="w-full sm:w-auto sm:flex-shrink-0">
                <Select
                  value={projectSortOrder}
                  onChange={(value) => onProjectSortOrderChange(value as ProjectSortOrder)}
                  options={[
                    { value: 'alphabetical', label: 'Alphabetically' },
                    { value: 'taskCount', label: 'By number of today\'s incomplete tasks' },
                    { value: 'recentActivity', label: 'Most recently active' },
                  ]}
                  className="w-full sm:min-w-[280px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Task Preferences</h3>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="ask-delete-confirmation" className="text-sm font-medium text-foreground">
                  Ask for delete confirmation
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, a confirmation dialog will appear before deleting tasks. When disabled, tasks will be deleted immediately.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  id="ask-delete-confirmation"
                  checked={askForTaskDeleteConfirmation}
                  onCheckedChange={onAskForTaskDeleteConfirmationChange}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="default-include-date" className="text-sm font-medium text-foreground">
                  Default include date in copy
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, the "Include date" toggle will be on by default when opening the copy modal. When disabled, it will be off by default.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  id="default-include-date"
                  checked={defaultIncludeDateInCopy}
                  onCheckedChange={onDefaultIncludeDateInCopyChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Data Management</h3>
          <p className="text-muted-foreground mb-6">
            Export your tasks and projects to a backup file, or import data from a previous backup.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExport}
              className="flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-muted transition-colors shadow-sm"
            >
              <ArrowDownTrayIcon className="mr-2 w-5 h-5" /> Export Data
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-muted transition-colors shadow-sm"
            >
              <ArrowUpTrayIcon className="mr-2 w-5 h-5" /> Import Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImport}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Auto Backup</h3>
          <p className="text-muted-foreground mb-6">
            {fileSystemSupported
              ? 'Press Ctrl+S (or Cmd+S on Mac) to automatically save backup.json to your selected folder. The backup file will be overwritten each time.'
              : 'This feature is not supported by your browser. Auto backup requires File System Access API support (available in Chrome, Edge, and Opera).'}
          </p>

          {fileSystemSupported ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Backup Folder
                </Label>
                {isLoadingConfig ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground">
                      {backupConfig?.path || 'Not selected'}
                    </div>
                    <Button
                      onClick={handleSelectFolder}
                      disabled={isSelectingFolder}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FolderIcon className="w-4 h-4" />
                      {isSelectingFolder ? 'Selecting...' : 'Change Folder'}
                    </Button>
                    {backupConfig?.directoryHandle && (
                      <Button
                        onClick={handleResetPath}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Reset to Default
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Default: {backupConfig ? getDefaultDownloadsPath(backupConfig.os) : 'Downloads'}
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 bg-muted/50 border border-border rounded-md">
              <p className="text-sm text-muted-foreground">
                This feature requires a browser that supports the File System Access API (Chrome, Edge, or Opera).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

