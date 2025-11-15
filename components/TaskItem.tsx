
import React from 'react';
import { Task } from '../types';
import { PencilIcon, TrashIcon, PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from './Icons';
import { Checkbox } from './ui/checkbox';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
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
    <div className="flex items-start p-3 bg-card rounded-lg shadow-sm hover:bg-muted transition-colors">
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="h-5 w-5 mt-0.5"
      />
      <span className={`ml-3 flex-grow whitespace-pre-line ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      <div className="flex items-center space-x-2">
        <span className={getPriorityColor(task.priority)}>
          {getPriorityIcon(task.priority)}
        </span>
        <button onClick={() => onEdit(task)} className="text-foreground/60 hover:text-primary transition-colors">
          <PencilIcon />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-foreground/60 hover:text-destructive transition-colors">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
