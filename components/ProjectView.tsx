import React, { useMemo, useState } from 'react';
import { Project, Task } from '../types';
import { PlusIcon, ClipboardIcon, XCircleIcon } from './Icons';
import TaskItem from './TaskItem';
import { getTodayDateString, getHumanReadableDate } from '../utils/dateUtils';
import { DatePicker } from './ui/date-picker';

interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  onAddTask: (projectId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  setNotification: (message: string) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, tasks, onAddTask, onUpdateTask, onDeleteTask, onEditTask, setNotification }) => {
  const [filterDate, setFilterDate] = useState('');
  
  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask({ ...task, isCompleted: !task.isCompleted });
    }
  };

  const copyTodaysTasks = () => {
    const today = getTodayDateString();
    const todaysTasks = tasks.filter(task => task.date === today);
    if (todaysTasks.length === 0) {
        setNotification("No tasks for today to copy.");
        return;
    }
    const taskList = todaysTasks.map(task => `    - ${task.title}`).join('\n');
    const content = `Today's task\n${taskList}`;
    navigator.clipboard.writeText(content);
    setNotification(`Copied ${todaysTasks.length} task(s) for today!`);
  };

  const filteredTasks = useMemo(() => {
    if (!filterDate) return tasks;
    return tasks.filter(task => task.date === filterDate);
  }, [tasks, filterDate]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
        const date = task.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);
  }, [filteredTasks]);

  const sortedDates = useMemo(() => {
      return Object.keys(groupedTasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedTasks]);


  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-3xl font-bold text-foreground">{project.name}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-auto">
              <DatePicker
                value={filterDate}
                onChange={setFilterDate}
                placeholder="Select a date"
                className="w-[200px]"
              />
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="p-1.5 text-foreground/60 hover:text-destructive transition-colors rounded-md hover:bg-muted" aria-label="Clear date filter">
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={copyTodaysTasks} className="flex items-center px-3 py-2 text-sm bg-card border border-border rounded-md shadow-sm hover:bg-muted text-foreground transition-colors">
              <ClipboardIcon className="mr-2 w-4 h-4"/> Copy Today's Tasks
          </button>
          <button onClick={() => onAddTask(project.id)} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors">
              <PlusIcon className="mr-2 w-5 h-5" /> Add Task
          </button>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">
                {getHumanReadableDate(date)}
              </h3>
              <div className="space-y-2">
                {groupedTasks[date].map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {filterDate ? `No tasks found for ${getHumanReadableDate(filterDate)}.` : 'No tasks in this project yet. Add one to get started!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectView;