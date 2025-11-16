import React, { useMemo, useState } from 'react';
import { Project, Task, TaskPriority } from '../types';
import { PlusIcon, ClipboardIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon, DocumentTextIcon } from './Icons';
import TaskItem from './TaskItem';
import { getTodayDateString, getHumanReadableDate } from '../utils/dateUtils';
import { DatePicker } from './ui/date-picker';
import Modal from './Modal';
import CopyTasksModal from './CopyTasksModal';

const getPriorityOrder = (priority?: TaskPriority): number => {
  switch (priority) {
    case 'high':
      return 0;
    case 'medium':
      return 1;
    case 'low':
      return 2;
    default:
      return 1; // Default to medium
  }
};

interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  onAddTask: (projectId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  setNotification: (message: string) => void;
  defaultIncludeDateInCopy: boolean;
  onOpenConfiguration: (projectId: string) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, tasks, onAddTask, onUpdateTask, onDeleteTask, onEditTask, setNotification, defaultIncludeDateInCopy, onOpenConfiguration }) => {
  const [filterDate, setFilterDate] = useState('');
  const [copyModalDate, setCopyModalDate] = useState<string | null>(null);
  // Track user's explicit state: collapsed dates (for today) and expanded dates (for other dates)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const today = getTodayDateString();

  // Check if a date is collapsed
  // Default: today's date is expanded, other dates are collapsed
  // User can toggle any date regardless
  const isDateCollapsed = (date: string) => {
    if (date === today) {
      // For today: default is expanded, so if it's in collapsed set, it's collapsed
      return collapsedDates.has(date);
    } else {
      // For other dates: default is collapsed, so if it's NOT in expanded set, it's collapsed
      return !expandedDates.has(date);
    }
  };

  const toggleDateCollapse = (date: string) => {
    const currentlyCollapsed = isDateCollapsed(date);

    if (date === today) {
      // For today: toggle in collapsed set
      setCollapsedDates(prev => {
        const newSet = new Set(prev);
        if (currentlyCollapsed) {
          // If currently collapsed, remove from set to expand
          newSet.delete(date);
        } else {
          // If currently expanded, add to set to collapse
          newSet.add(date);
        }
        return newSet;
      });
    } else {
      // For other dates: toggle in expanded set
      setExpandedDates(prev => {
        const newSet = new Set(prev);
        if (currentlyCollapsed) {
          // If currently collapsed, add to set to expand
          newSet.add(date);
        } else {
          // If currently expanded, remove from set to collapse
          newSet.delete(date);
        }
        return newSet;
      });
    }
  };

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
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="flex-1 sm:w-auto sm:flex-initial">
              <DatePicker
                value={filterDate}
                onChange={setFilterDate}
                placeholder="Select a date"
                className="w-full sm:w-[200px] h-9"
              />
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="h-9 w-9 p-1.5 text-foreground/60 hover:text-destructive transition-colors rounded-md hover:bg-muted flex items-center justify-center flex-shrink-0" aria-label="Clear date filter">
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={() => onAddTask(project.id)}
              className="flex items-center justify-center px-3 sm:px-4 h-9 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap flex-1 sm:flex-initial"
            >
              <PlusIcon className="mr-2 w-4 h-4 flex-shrink-0" /> Add Task
            </button>
            <button
              onClick={() => onOpenConfiguration(project.id)}
              className="flex items-center justify-center px-3 sm:px-4 h-9 text-xs sm:text-sm text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted transition-colors whitespace-nowrap flex-1 sm:flex-initial"
              aria-label="Open configuration"
            >
              <DocumentTextIcon className="mr-2 w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Configuration</span>
              <span className="sm:hidden">Config</span>
            </button>
          </div>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const isCollapsed = isDateCollapsed(date);
            return (
              <div key={date}>
                <div className="flex items-center mb-3 border-b border-border pb-2">
                  <button
                    onClick={() => toggleDateCollapse(date)}
                    className="text-foreground/60 hover:text-primary transition-colors p-1 mr-2"
                    title={isCollapsed ? "Expand tasks" : "Collapse tasks"}
                    aria-label={isCollapsed ? "Expand tasks" : "Collapse tasks"}
                  >
                    {isCollapsed ? (
                      <ChevronRightIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                  <h3 className="text-lg font-semibold text-foreground flex-1 flex items-center gap-2">
                    {getHumanReadableDate(date)}
                    <button
                      onClick={() => handleCopyClick(date)}
                      className="text-foreground/60 hover:text-primary transition-colors p-1"
                      aria-label={`Copy tasks for ${getHumanReadableDate(date)}`}
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  </h3>
                </div>
                {!isCollapsed && (
                  <div className="space-y-2 pl-6">
                    {(() => {
                      const tasksForDate = groupedTasks[date];
                      const parentTasks = tasksForDate.filter(t => !t.parentTaskId);
                      const subtasksMap = new Map<string, Task[]>();
                      
                      // Group subtasks by parent
                      tasksForDate.forEach(task => {
                        if (task.parentTaskId) {
                          if (!subtasksMap.has(task.parentTaskId)) {
                            subtasksMap.set(task.parentTaskId, []);
                          }
                          subtasksMap.get(task.parentTaskId)!.push(task);
                        }
                      });
                      
                      // Sort parent tasks by priority
                      const sortedParents = parentTasks.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
                      
                      // Render parent tasks with their subtasks
                      return sortedParents.map(parentTask => {
                        const subtasks = subtasksMap.get(parentTask.id) || [];
                        const sortedSubtasks = subtasks.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
                        
                        return (
                          <div key={parentTask.id}>
                            <TaskItem
                              task={parentTask}
                              onToggleComplete={handleToggleComplete}
                              onDelete={onDeleteTask}
                              onEdit={onEditTask}
                              isSubtask={false}
                            />
                            {sortedSubtasks.map(subtask => (
                              <TaskItem
                                key={subtask.id}
                                task={subtask}
                                onToggleComplete={handleToggleComplete}
                                onDelete={onDeleteTask}
                                onEdit={onEditTask}
                                isSubtask={true}
                              />
                            ))}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            );
          })}
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