import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface BatchTaskModalProps {
  projects: Project[];
  onSubmit: (tasks: Array<{ title: string; projectId: string }>) => void;
  onCancel: () => void;
}

type TaskRow = {
  id: number;
  title: string;
  projectId: string;
};

const BatchTaskModal: React.FC<BatchTaskModalProps> = ({ projects, onSubmit, onCancel }) => {
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { id: Date.now(), title: '', projectId: projects[0]?.id || '' },
  ]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the last input when a new row is added
    if (inputsRef.current.length > 0) {
      const lastInput = inputsRef.current[inputsRef.current.length - 1];
      lastInput?.focus();
    }
  }, [taskRows.length]);

  const handleAddRow = () => {
    const lastProject = taskRows.length > 0 ? taskRows[taskRows.length - 1].projectId : projects[0]?.id || '';
    setTaskRows([...taskRows, { id: Date.now(), title: '', projectId: lastProject }]);
  };

  const handleRemoveRow = (id: number) => {
    setTaskRows(taskRows.filter(row => row.id !== id));
  };

  const handleRowChange = (id: number, field: 'title' | 'projectId', value: string) => {
    setTaskRows(
      taskRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRow();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasksToSubmit = taskRows.filter(row => row.title.trim() !== '' && row.projectId);
    onSubmit(tasksToSubmit);
  };

  if (projects.length === 0) {
    return (
        <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to create a project first before adding tasks.</p>
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
            >
                Close
            </button>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
        {taskRows.map((row, index) => (
          <div key={row.id} className="flex items-center space-x-2">
            <select
              value={row.projectId}
              onChange={(e) => handleRowChange(row.id, 'projectId', e.target.value)}
              className="block w-1/3 px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              // FIX: The ref callback should not return a value. Using a block body for the arrow function fixes the type error.
              ref={el => { inputsRef.current[index] = el; }}
              type="text"
              placeholder="Task title..."
              value={row.title}
              onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
              onKeyDown={handleKeyDown}
              className="block w-2/3 px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
            />
            <button type="button" onClick={() => handleRemoveRow(row.id)} className="text-foreground/60 hover:text-destructive transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddRow}
        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-primary bg-muted hover:bg-muted/80 transition-colors"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add Another Task
      </button>

      <div className="flex justify-end space-x-2 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none transition-colors"
        >
          Add All Tasks
        </button>
      </div>
    </form>
  );
};

export default BatchTaskModal;