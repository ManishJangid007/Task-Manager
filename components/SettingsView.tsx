import React, { useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { ProjectSortOrder } from '../types';

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
}

const SettingsView: React.FC<SettingsViewProps> = ({ onExport, onImport, includeCompletedTasks, onIncludeCompletedTasksChange, projectSortOrder, onProjectSortOrderChange, askForTaskDeleteConfirmation, onAskForTaskDeleteConfirmationChange, defaultIncludeDateInCopy, onDefaultIncludeDateInCopyChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
      </div>
    </div>
  );
};

export default SettingsView;

