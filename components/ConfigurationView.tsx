import React, { useState, useMemo } from 'react';
import { Project, Configuration } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon } from './Icons';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import Modal from './Modal';
import ConfigurationModal from './ConfigurationModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ConfigurationViewProps {
  project: Project;
  configurations: Configuration[];
  onAddConfiguration: (config: Omit<Configuration, 'id'>) => void;
  onUpdateConfiguration: (config: Configuration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onBack: () => void;
  setNotification: (message: string) => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({
  project,
  configurations,
  onAddConfiguration,
  onUpdateConfiguration,
  onDeleteConfiguration,
  onBack,
  setNotification,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isLink = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    const trimmed = value.trim();
    // Check if it starts with http:// or https://
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
    // Also check for common URL patterns without protocol
    const urlPattern = /^(www\.|[\w-]+\.)+[a-z]{2,}(\/.*)?$/i;
    if (urlPattern.test(trimmed)) {
      return true;
    }
    return false;
  };

  const handleCopy = (text: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setNotification('Copied to clipboard!');
  };

  const handleAdd = (key: string, value: string) => {
    onAddConfiguration({
      projectId: project.id,
      key: key.trim(),
      value: value.trim(),
    });
    setIsAddModalOpen(false);
    setNotification('Configuration added successfully!');
  };

  const handleUpdate = (key: string, value: string) => {
    if (editingConfig) {
      onUpdateConfiguration({
        ...editingConfig,
        key: key.trim(),
        value: value.trim(),
      });
      setEditingConfig(null);
      setNotification('Configuration updated successfully!');
    }
  };

  const handleDelete = (configId: string) => {
    onDeleteConfiguration(configId);
    setDeleteDialog(null);
    setNotification('Configuration deleted successfully!');
  };

  const filteredConfigurations = useMemo(() => {
    if (!searchQuery.trim()) {
      return configurations;
    }
    const query = searchQuery.toLowerCase().trim();
    return configurations.filter(config =>
      config.key.toLowerCase().includes(query) ||
      config.value.toLowerCase().includes(query)
    );
  }, [configurations, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Back to project"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {project.name} Config
            </h2>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Configuration
          </Button>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by key or value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-background border border-border rounded-md placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredConfigurations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {configurations.length === 0
              ? 'No configurations yet. Add one to get started!'
              : searchQuery
                ? 'No configurations found matching your search.'
                : 'No configurations yet. Add one to get started!'}
          </p>
        </div>
      ) : (
        <TooltipProvider>
          <div className="border border-border rounded-lg p-2 overflow-x-auto">
            <Table overflow="visible">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] min-w-[150px]">Key</TableHead>
                  <TableHead className="w-[40%] min-w-[150px]">Value</TableHead>
                  <TableHead className="w-[20%] min-w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigurations.map((config) => (
                  <TableRow key={config.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableCell
                          className="cursor-pointer group relative"
                          onClick={() => handleCopy(config.key)}
                        >
                          <span className="truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform">
                            {config.key}
                          </span>
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableCell
                          className="cursor-pointer group relative"
                          onClick={() => handleCopy(config.value)}
                        >
                          {isLink(config.value) ? (
                            <a
                              href={config.value.startsWith('http') ? config.value : `https://${config.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="text-primary hover:underline truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform"
                            >
                              {config.value}
                            </a>
                          ) : (
                            <span className="truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform">
                              {config.value}
                            </span>
                          )}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy</p>
                      </TooltipContent>
                    </Tooltip>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingConfig(config)}
                          className="p-2 text-foreground/60 hover:text-primary hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog(config.id)}
                          className="p-2 text-foreground/60 hover:text-destructive hover:bg-muted rounded-md transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}

      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Configuration"
          size="large"
        >
          <ConfigurationModal
            onSubmit={handleAdd}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}

      {editingConfig && (
        <Modal
          isOpen={true}
          onClose={() => setEditingConfig(null)}
          title="Edit Configuration"
          size="large"
        >
          <ConfigurationModal
            config={editingConfig}
            onSubmit={handleUpdate}
            onCancel={() => setEditingConfig(null)}
          />
        </Modal>
      )}

      <AlertDialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConfigurationView;

