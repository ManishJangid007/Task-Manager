import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon } from './Icons';
import { DatePicker } from './ui/date-picker';
import { Select } from './ui/select';
import { TaskPriority } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface ProjectBatchTaskModalProps {
  projectId: string;
  onSubmit: (tasks: Array<{ title: string; date: string; priority: TaskPriority }>) => void;
  onCancel: () => void;
}

type TaskRow = {
  id: number;
  title: string;
  date: string;
  priority: TaskPriority;
};

const ProjectBatchTaskModal: React.FC<ProjectBatchTaskModalProps> = ({ projectId, onSubmit, onCancel }) => {
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { id: Date.now(), title: '', date: getTodayDateString(), priority: 'medium' },
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
    // Don't add a new row if the last row's title is empty
    if (taskRows.length > 0) {
      const lastRow = taskRows[taskRows.length - 1];
      if (!lastRow.title.trim()) {
        return;
      }
    }
    const lastRow = taskRows.length > 0 ? taskRows[taskRows.length - 1] : null;
    const lastDate = lastRow?.date || getTodayDateString();
    const lastPriority = lastRow?.priority || 'medium';
    setTaskRows([...taskRows, { id: Date.now(), title: '', date: lastDate, priority: lastPriority }]);
  };

  const handleRemoveRow = (id: number) => {
    // Prevent deleting the last row
    if (taskRows.length <= 1) {
      return;
    }
    setTaskRows(taskRows.filter(row => row.id !== id));
  };

  const handleRowChange = (id: number, field: 'title' | 'date' | 'priority', value: string) => {
    setTaskRows(
      taskRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number) => {
    if (e.key === 'Enter') {
      // Only add a new row if the current row's title is not empty
      const currentRow = taskRows[rowIndex];
      if (currentRow.title.trim()) {
        e.preventDefault();
        handleAddRow();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasksToSubmit = taskRows
      .filter(row => row.title.trim() !== '' && row.date)
      .map(row => ({ title: row.title, date: row.date, priority: row.priority }));
    onSubmit(tasksToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 min-h-0">
        {taskRows.map((row, index) => (
          <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none sm:w-1/4">
              <DatePicker
                value={row.date}
                onChange={(value) => handleRowChange(row.id, 'date', value)}
                placeholder="Select date..."
                className="w-full h-9"
              />
            </div>
            <input
              ref={el => { inputsRef.current[index] = el; }}
              type="text"
              placeholder="Task title..."
              value={row.title}
              onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
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

export default ProjectBatchTaskModal;

