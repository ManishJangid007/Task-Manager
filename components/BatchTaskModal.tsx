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
            <p className="text-gray-600 dark:text-gray-400 mb-4">You need to create a project first before adding tasks.</p>
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
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
              className="block w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="block w-2/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button type="button" onClick={() => handleRemoveRow(row.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddRow}
        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-gray-700 hover:bg-indigo-200 dark:hover:bg-gray-600 transition-colors"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add Another Task
      </button>

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
        >
          Add All Tasks
        </button>
      </div>
    </form>
  );
};

export default BatchTaskModal;