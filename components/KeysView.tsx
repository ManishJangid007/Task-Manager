import React, { useState, useMemo } from 'react';
import { Key } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from './Icons';
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
import KeyModal from './KeyModal';
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

interface KeysViewProps {
  keys: Key[];
  onAddKey: (key: Omit<Key, 'id'>) => void;
  onUpdateKey: (key: Key) => void;
  onDeleteKey: (keyId: string) => void;
  setNotification: (message: string) => void;
}

const KeysView: React.FC<KeysViewProps> = ({
  keys,
  onAddKey,
  onUpdateKey,
  onDeleteKey,
  setNotification,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllKeys, setShowAllKeys] = useState(false);

  const handleCopy = (text: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setNotification('Copied to clipboard!');
  };

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) {
      return keys;
    }
    const query = searchQuery.toLowerCase().trim();
    return keys.filter(key =>
      (key.nameUrl || '').toLowerCase().includes(query) ||
      (key.usernameEmail || '').toLowerCase().includes(query) ||
      (key.passwordKey || '').toLowerCase().includes(query)
    );
  }, [keys, searchQuery]);

  const handleAdd = (keyData: Omit<Key, 'id'>) => {
    onAddKey(keyData);
    setIsAddModalOpen(false);
    setNotification('Key added successfully!');
  };

  const handleUpdate = (keyData: Omit<Key, 'id'>) => {
    if (editingKey) {
      onUpdateKey({
        ...editingKey,
        ...keyData,
      });
      setEditingKey(null);
      setNotification('Key updated successfully!');
    }
  };

  const handleDelete = (keyId: string) => {
    onDeleteKey(keyId);
    setDeleteDialog(null);
    setNotification('Key deleted successfully!');
  };

  const getDisplayValue = (key: Key, type: 'nameUrl' | 'usernameEmail' | 'passwordKey'): string => {
    if (type === 'passwordKey') {
      const value = key.passwordKey;
      if (!value) return '';
      return showAllKeys ? value : '•'.repeat(Math.min(value.length, 20));
    }
    return key[type] || '';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Keys</h2>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAllKeys(!showAllKeys)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <div className="relative w-4 h-4">
                <EyeIcon className={`w-4 h-4 absolute transition-all duration-300 ${showAllKeys ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                <EyeSlashIcon className={`w-4 h-4 absolute transition-all duration-300 ${showAllKeys ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
              </div>
              Show Keys
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Key
            </Button>
          </div>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keys..."
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

      {filteredKeys.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {keys.length === 0
              ? 'No keys yet. Add one to get started!'
              : searchQuery
                ? 'No keys found matching your search.'
                : 'No keys yet. Add one to get started!'}
          </p>
        </div>
      ) : (
        <TooltipProvider>
          <div className="border border-border rounded-lg p-2 overflow-x-auto">
            <Table overflow="visible">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '27%' }} className="min-w-[150px]">Name / Site Url</TableHead>
                  <TableHead style={{ width: '27%' }} className="min-w-[150px]">Username / Email</TableHead>
                  <TableHead style={{ width: '27%' }} className="min-w-[150px]">Password / Key</TableHead>
                  <TableHead style={{ width: '19%' }} className="min-w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((key) => (
                  <TableRow key={key.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableCell
                          className="cursor-pointer group relative"
                          onClick={() => handleCopy(getDisplayValue(key, 'nameUrl'))}
                        >
                          <span className="truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform">
                            {getDisplayValue(key, 'nameUrl') || '-'}
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
                          onClick={() => handleCopy(getDisplayValue(key, 'usernameEmail'))}
                        >
                          <span className="truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform">
                            {getDisplayValue(key, 'usernameEmail') || '-'}
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
                          className="cursor-pointer font-mono group relative"
                          onClick={() => {
                            const actualValue = key.passwordKey || '';
                            if (actualValue) {
                              handleCopy(actualValue);
                            }
                          }}
                        >
                          <span className="truncate block transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] group-hover:drop-shadow-md will-change-transform">
                            <span className="group-hover:hidden">
                              {getDisplayValue(key, 'passwordKey') || '-'}
                            </span>
                            <span className="hidden group-hover:inline">
                              {key.passwordKey || '-'}
                            </span>
                          </span>
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy</p>
                      </TooltipContent>
                    </Tooltip>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingKey(key)}
                          className="p-2 text-foreground/60 hover:text-primary hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog(key.id)}
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
          title="Add Key"
          size="large"
        >
          <KeyModal
            onSubmit={handleAdd}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}

      {editingKey && (
        <Modal
          isOpen={true}
          onClose={() => setEditingKey(null)}
          title="Edit Key"
          size="large"
        >
          <KeyModal
            key={editingKey.id}
            keyData={editingKey}
            onSubmit={handleUpdate}
            onCancel={() => setEditingKey(null)}
          />
        </Modal>
      )}

      <AlertDialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this key? This action cannot be undone.
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

export default KeysView;

