
import React from 'react';
import { Task } from '../types';
import { PencilIcon, TrashIcon, PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from './Icons';
import { Checkbox } from './ui/checkbox';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  isSubtask?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit, isSubtask = false }) => {
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <PriorityHighIcon className="w-4 h-4" />;
      case 'medium':
        return <PriorityMediumIcon className="w-4 h-4" />;
      case 'low':
        return <PriorityLowIcon className="w-4 h-4" />;
      default:
        return <PriorityMediumIcon className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className={`flex items-start p-3 bg-card rounded-lg shadow-sm hover:bg-muted transition-colors gap-2 sm:gap-0 ${isSubtask ? 'ml-4 sm:ml-6' : ''}`}>
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="h-5 w-5 mt-0.5 flex-shrink-0"
      />
      <span className={`ml-0 sm:ml-3 flex-grow min-w-0 whitespace-pre-line break-words ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <span className={getPriorityColor(task.priority)}>
          {getPriorityIcon(task.priority)}
        </span>
        <button onClick={() => onEdit(task)} className="text-foreground/60 hover:text-primary transition-colors p-1">
          <PencilIcon className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-foreground/60 hover:text-destructive transition-colors p-1">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
