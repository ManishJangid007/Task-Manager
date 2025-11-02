
import React from 'react';
import { Task } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  return (
    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggleComplete(task.id)}
        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:focus:ring-offset-gray-900"
      />
      <span className={`ml-3 flex-grow ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
        {task.title}
      </span>
      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <PencilIcon />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
