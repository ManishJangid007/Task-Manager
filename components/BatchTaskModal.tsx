import React, { useState, useRef, useEffect } from 'react';
import { Project, TaskPriority } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { Combobox } from './ui/combobox';
import { Select } from './ui/select';

interface BatchTaskModalProps {
  projects: Project[];
  onSubmit: (tasks: Array<{ title: string; projectId: string; priority: TaskPriority }>) => void;
  onCancel: () => void;
}

type TaskRow = {
  id: number;
  title: string;
  projectId: string;
  priority: TaskPriority;
};

const BatchTaskModal: React.FC<BatchTaskModalProps> = ({ projects, onSubmit, onCancel }) => {
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { id: Date.now(), title: '', projectId: projects[0]?.id || '', priority: 'medium' },
  ]);
  const inputsRef = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    // Focus the last input when a new row is added
    if (inputsRef.current.length > 0) {
      const lastInput = inputsRef.current[inputsRef.current.length - 1];
      lastInput?.focus();
    }
  }, [taskRows.length]);

  const handleAddRow = () => {
    // Don't add a new row if the last row's title is empty
    if (taskRows.length > 0) {
      const lastRow = taskRows[taskRows.length - 1];
      if (!lastRow.title.trim()) {
        return;
      }
    }
    const lastRow = taskRows.length > 0 ? taskRows[taskRows.length - 1] : null;
    const lastProject = lastRow?.projectId || projects[0]?.id || '';
    const lastPriority = lastRow?.priority || 'medium';
    setTaskRows([...taskRows, { id: Date.now(), title: '', projectId: lastProject, priority: lastPriority }]);
  };

  const handleRemoveRow = (id: number) => {
    // Prevent deleting the last row
    if (taskRows.length <= 1) {
      return;
    }
    setTaskRows(taskRows.filter(row => row.id !== id));
  };

  const handleRowChange = (id: number, field: 'title' | 'projectId' | 'priority', value: string) => {
    setTaskRows(
      taskRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, rowIndex: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Always prevent default to avoid newline
      const currentRow = taskRows[rowIndex];
      if (currentRow.title.trim()) {
        // Only add a new row if the current row's title is not empty
        handleAddRow();
      } else {
        // If empty, submit the form
        const form = e.currentTarget.closest('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
    }
    // Shift+Enter allows default behavior (new line in textarea)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasksToSubmit = taskRows
      .filter(row => row.title.trim() !== '' && row.projectId)
      .map(row => ({ title: row.title, projectId: row.projectId, priority: row.priority }));
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 min-h-0">
        {taskRows.map((row, index) => (
          <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none sm:w-1/4">
              <Combobox
                value={row.projectId}
                onChange={(value) => handleRowChange(row.id, 'projectId', value)}
                options={projects.map(p => ({ value: p.id, label: p.name }))}
                placeholder="Select project..."
                searchPlaceholder="Search projects..."
                className="w-full"
              />
            </div>
            <textarea
              ref={el => { inputsRef.current[index] = el; }}
              placeholder="Task title..."
              value={row.title}
              onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              rows={1}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground resize-none min-h-[2.5rem] sm:min-h-[2.25rem]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <div className="flex-1 sm:flex-none sm:w-1/4">
              <Select
                value={row.priority}
                onChange={(value) => handleRowChange(row.id, 'priority', value as TaskPriority)}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                placeholder="Priority..."
                className="w-full h-9"
              />
            </div>
            <button 
              type="button" 
              onClick={() => handleRemoveRow(row.id)} 
              disabled={taskRows.length <= 1}
              className={`self-start sm:self-auto px-3 py-2.5 sm:px-2 sm:py-1 rounded-md transition-colors ${
                taskRows.length <= 1
                  ? 'text-foreground/20 cursor-not-allowed opacity-50'
                  : 'text-foreground/60 hover:text-destructive hover:bg-muted'
              }`}
              aria-label="Remove task"
              title={taskRows.length <= 1 ? 'At least one task row is required' : 'Remove task'}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 space-y-4">
        <button
          type="button"
          onClick={handleAddRow}
          disabled={taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim()}
          className={`w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium rounded-md transition-colors ${
            taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim()
              ? 'text-foreground/40 bg-muted/50 cursor-not-allowed opacity-50'
              : 'text-primary bg-muted hover:bg-muted/80'
          }`}
          title={taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim() ? 'Please fill in the task title above before adding another' : 'Add another task'}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Another Task
        </button>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium bg-primary text-primary-foreground border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none transition-colors"
        >
          Add All Tasks
        </button>
      </div>
      </div>
    </form>
  );
};

export default BatchTaskModal;