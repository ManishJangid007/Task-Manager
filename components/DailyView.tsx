import React, { useState, useMemo } from 'react';
import { Task, Project } from '../types';
import TaskItem from './TaskItem';
import { getHumanReadableDate, getTodayDateString } from '../utils/dateUtils';
import { ClipboardIcon, XCircleIcon } from './Icons';

interface DailyViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  setNotification: (message: string) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ tasks, projects, onUpdateTask, onDeleteTask, onEditTask, setNotification }) => {
  const [filterDate, setFilterDate] = useState('');

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
        const date = task.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      }, {} as Record<string, Task[]>);
  }, [tasks]);


  const sortedDates = useMemo(() => {
      const allSortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (!filterDate) return allSortedDates;
      return allSortedDates.filter(date => date === filterDate);
  }, [groupedTasks, filterDate]);

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask({ ...task, isCompleted: !task.isCompleted });
    }
  };

  const copyDaysTasks = (date: string) => {
    const dayTasks = groupedTasks[date];
    if (!dayTasks || dayTasks.length === 0) {
        setNotification("No tasks for this day to copy.");
        return;
    }

    const dateObj = new Date(date + 'T00:00:00');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const dayOfMonth = dateObj.getDate().toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${month}-${dayOfMonth}-${year}`;
    
    const isToday = date === getTodayDateString();
    let content = isToday ? `Today's tasks [${formattedDate}]\n` : `Date [${formattedDate}]\n`;

    const tasksByProject = dayTasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
            acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    for (const projectId in tasksByProject) {
        const projectName = getProjectName(projectId);
        content += `    ${projectName}\n`;
        tasksByProject[projectId].forEach(task => {
            content += `       - ${task.title}\n`;
        });
        content += `\n`;
    }

    navigator.clipboard.writeText(content.trim());
    setNotification(`Copied ${dayTasks.length} task(s) for ${getHumanReadableDate(date)}!`);
  }

  return (
    <div className="p-6 space-y-6">
       <h2 className="text-3xl font-bold text-foreground">Tasks by Date</h2>
       
       <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md border border-border">
          <label htmlFor="date-filter-daily" className="text-sm font-medium text-foreground">Filter by date:</label>
          <input 
            id="date-filter-daily"
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="block px-2 py-1 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="p-1 text-foreground/60 hover:text-destructive transition-colors">
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>

       {sortedDates.length > 0 ? (
        sortedDates.map(date => (
          <div key={date}>
            <div className="flex items-center mb-3">
              <h3 className="text-xl font-semibold text-foreground">{getHumanReadableDate(date)}</h3>
              <button onClick={() => copyDaysTasks(date)} className="ml-4 text-foreground/60 hover:text-primary transition-colors">
                <ClipboardIcon />
              </button>
            </div>
            <div className="space-y-2">
              {groupedTasks[date].map(task => (
                 <div key={task.id} className="pl-4 border-l-2 border-primary/30">
                    <div className="text-xs text-primary font-medium mb-1">{getProjectName(task.projectId)}</div>
                     <TaskItem
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                    />
                 </div>
              ))}
            </div>
          </div>
        ))
       ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {filterDate ? `No tasks found for ${getHumanReadableDate(filterDate)}.` : 'No tasks scheduled. Add some tasks to a project to see them here.'}
          </p>
        </div>
       )}
    </div>
  );
};

export default DailyView;