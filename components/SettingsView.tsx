import React, { useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';

interface SettingsViewProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Settings</h2>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-4">Data Management</h3>
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

