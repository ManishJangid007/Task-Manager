
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
  return (
    <div className="flex items-center p-3 bg-card rounded-lg shadow-sm hover:bg-muted transition-colors">
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="h-5 w-5"
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
