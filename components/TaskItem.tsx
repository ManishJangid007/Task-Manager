
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
    <div className="flex items-center p-3 bg-card rounded-lg shadow-sm hover:bg-muted transition-colors">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggleComplete(task.id)}
        className="w-5 h-5 rounded text-primary focus:ring-primary border-border bg-background focus:ring-offset-background"
      />
      <span className={`ml-3 flex-grow ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      <div className="flex items-center space-x-2">
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
