
import React from 'react';
import { Task } from '../types';
import { PencilIcon, TrashIcon } from './Icons';
import { Checkbox } from './ui/checkbox';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-yellow-500 text-white'; // Default to medium priority color
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Medium';
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
        <span className={`${getPriorityBadgeColor(task.priority)} text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap`}>
          {getPriorityLabel(task.priority)}
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
