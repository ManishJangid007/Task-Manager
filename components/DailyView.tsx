import React, { useState, useMemo } from 'react';
import { Task, Project } from '../types';
import TaskItem from './TaskItem';
import { getHumanReadableDate, getTodayDateString } from '../utils/dateUtils';
import { ClipboardIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';
import { DatePicker } from './ui/date-picker';

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
  // Track user's explicit state: collapsed projects (for today) and expanded projects (for other dates)
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

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

  const today = getTodayDateString();
  
  // Check if a project is collapsed for a specific date
  // Default: today's projects are expanded, other dates' projects are collapsed
  // User can toggle any project regardless of date
  const isProjectCollapsed = (projectId: string, date: string) => {
    const projectDateKey = `${date}-${projectId}`;
    
    if (date === today) {
      // For today: default is expanded, so if it's in collapsed set, it's collapsed
      return collapsedProjects.has(projectDateKey);
    } else {
      // For other dates: default is collapsed, so if it's NOT in expanded set, it's collapsed
      return !expandedProjects.has(projectDateKey);
    }
  };

  const toggleProjectCollapse = (projectId: string, date: string) => {
    const projectDateKey = `${date}-${projectId}`;
    const currentlyCollapsed = isProjectCollapsed(projectId, date);
    
    if (date === today) {
      // For today: toggle in collapsed set
      setCollapsedProjects(prev => {
        const newSet = new Set(prev);
        if (currentlyCollapsed) {
          // If currently collapsed, remove from set to expand
          newSet.delete(projectDateKey);
        } else {
          // If currently expanded, add to set to collapse
          newSet.add(projectDateKey);
        }
        return newSet;
      });
    } else {
      // For other dates: toggle in expanded set
      setExpandedProjects(prev => {
        const newSet = new Set(prev);
        if (currentlyCollapsed) {
          // If currently collapsed, add to set to expand
          newSet.add(projectDateKey);
        } else {
          // If currently expanded, remove from set to collapse
          newSet.delete(projectDateKey);
        }
        return newSet;
      });
    }
  };

  const expandAllProjects = (date: string, projectIds: string[]) => {
    if (date === today) {
      // For today: remove all from collapsed set
      setCollapsedProjects(prev => {
        const newSet = new Set(prev);
        projectIds.forEach(projectId => {
          newSet.delete(`${date}-${projectId}`);
        });
        return newSet;
      });
    } else {
      // For other dates: add all to expanded set
      setExpandedProjects(prev => {
        const newSet = new Set(prev);
        projectIds.forEach(projectId => {
          newSet.add(`${date}-${projectId}`);
        });
        return newSet;
      });
    }
  };

  const collapseAllProjects = (date: string, projectIds: string[]) => {
    if (date === today) {
      // For today: add all to collapsed set
      setCollapsedProjects(prev => {
        const newSet = new Set(prev);
        projectIds.forEach(projectId => {
          newSet.add(`${date}-${projectId}`);
        });
        return newSet;
      });
    } else {
      // For other dates: remove all from expanded set
      setExpandedProjects(prev => {
        const newSet = new Set(prev);
        projectIds.forEach(projectId => {
          newSet.delete(`${date}-${projectId}`);
        });
        return newSet;
      });
    }
  };

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
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-bold text-foreground">All Tasks</h2>
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
       </div>

       {sortedDates.length > 0 ? (
        sortedDates.map(date => {
          // Group tasks by project for this date
          const tasksByProject = groupedTasks[date].reduce((acc, task) => {
            if (!acc[task.projectId]) {
              acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
          }, {} as Record<string, Task[]>);

          // Get project IDs sorted by project name
          const sortedProjectIds = Object.keys(tasksByProject).sort((a, b) => {
            const nameA = getProjectName(a);
            const nameB = getProjectName(b);
            return nameA.localeCompare(nameB);
          });

          // Check if all projects are collapsed for this date
          const allCollapsed = sortedProjectIds.every(projectId => isProjectCollapsed(projectId, date));
          const allExpanded = sortedProjectIds.every(projectId => !isProjectCollapsed(projectId, date));
          
          // Determine if we should show expand or collapse action
          // If all are collapsed, show expand. Otherwise, show collapse.
          const shouldExpand = allCollapsed;
          
          const toggleAllProjects = () => {
            if (shouldExpand) {
              expandAllProjects(date, sortedProjectIds);
            } else {
              collapseAllProjects(date, sortedProjectIds);
            }
          };

          return (
            <div key={date} className="space-y-4">
              <div className="flex items-center mb-3 gap-2">
                <h3 className="text-xl font-semibold text-foreground">{getHumanReadableDate(date)}</h3>
                <button 
                  onClick={toggleAllProjects} 
                  className="text-foreground/60 hover:text-primary transition-colors p-1"
                  title={shouldExpand ? "Expand all projects" : "Collapse all projects"}
                  aria-label={shouldExpand ? "Expand all projects" : "Collapse all projects"}
                >
                  {shouldExpand ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
                <button onClick={() => copyDaysTasks(date)} className="text-foreground/60 hover:text-primary transition-colors p-1">
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              </div>
              {sortedProjectIds.map(projectId => {
                const isCollapsed = isProjectCollapsed(projectId, date);
                return (
                  <div key={projectId} className="space-y-2">
                    <button
                      onClick={() => toggleProjectCollapse(projectId, date)}
                      className="text-sm font-semibold text-foreground/80 pl-4 border-l-2 border-primary/30 flex items-center gap-2 w-full text-left hover:text-primary transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                      )}
                      {getProjectName(projectId)}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({tasksByProject[projectId].length})
                      </span>
                    </button>
                    {!isCollapsed && (
                      <div className="space-y-1 pl-4">
                        {tasksByProject[projectId].map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onDelete={onDeleteTask}
                            onEdit={onEditTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
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