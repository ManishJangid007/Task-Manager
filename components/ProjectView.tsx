import React, { useMemo, useState } from 'react';
import { Project, Task } from '../types';
import { PlusIcon, ClipboardIcon, XCircleIcon } from './Icons';
import TaskItem from './TaskItem';
import { getTodayDateString, getHumanReadableDate } from '../utils/dateUtils';
import { DatePicker } from './ui/date-picker';
import Modal from './Modal';
import CopyTasksModal from './CopyTasksModal';

interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  onAddTask: (projectId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  setNotification: (message: string) => void;
  defaultIncludeDateInCopy: boolean;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, tasks, onAddTask, onUpdateTask, onDeleteTask, onEditTask, setNotification, defaultIncludeDateInCopy }) => {
  const [filterDate, setFilterDate] = useState('');
  const [copyModalDate, setCopyModalDate] = useState<string | null>(null);
  
  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask({ ...task, isCompleted: !task.isCompleted });
    }
  };

  const handleCopyClick = (date: string) => {
    const dayTasks = groupedTasks[date];
    if (!dayTasks || dayTasks.length === 0) {
        setNotification("No tasks for this day to copy.");
        return;
    }
    setCopyModalDate(date);
  };

  const handleCopyTasks = (content: string, date: string) => {
    navigator.clipboard.writeText(content);
    const dayTasks = groupedTasks[date];
    setNotification(`Copied ${dayTasks.length} task(s) for ${getHumanReadableDate(date)}!`);
    setCopyModalDate(null);
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-auto">
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              placeholder="Select a date"
              className="w-full sm:w-[200px] h-9"
            />
          </div>
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="h-9 w-9 p-1.5 text-foreground/60 hover:text-destructive transition-colors rounded-md hover:bg-muted flex items-center justify-center" aria-label="Clear date filter">
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onAddTask(project.id)} 
            className="flex items-center justify-center px-3 sm:px-4 h-9 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <PlusIcon className="mr-2 w-4 h-4 flex-shrink-0" /> Add Task
          </button>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center mb-3 border-b border-border pb-2">
                <h3 className="text-lg font-semibold text-foreground">{getHumanReadableDate(date)}</h3>
                <button 
                  onClick={() => handleCopyClick(date)} 
                  className="ml-4 text-foreground/60 hover:text-primary transition-colors"
                  aria-label={`Copy tasks for ${getHumanReadableDate(date)}`}
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
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

      {copyModalDate && (
        <Modal isOpen={true} onClose={() => setCopyModalDate(null)} title="Copy Tasks">
          <CopyTasksModal
            tasks={groupedTasks[copyModalDate] || []}
            date={copyModalDate}
            onCopy={(content) => handleCopyTasks(content, copyModalDate)}
            onCancel={() => setCopyModalDate(null)}
            defaultIncludeDate={defaultIncludeDateInCopy}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProjectView;