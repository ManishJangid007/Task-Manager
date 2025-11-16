import React, { useState, useMemo } from 'react';
import { Task, Project, TaskPriority } from '../types';
import TaskItem from './TaskItem';
import { getHumanReadableDate, getTodayDateString } from '../utils/dateUtils';
import { ClipboardIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';
import { DatePicker } from './ui/date-picker';
import Modal from './Modal';
import SimpleCopyModal from './SimpleCopyModal';
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

interface DailyViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  setNotification: (message: string) => void;
  defaultIncludeDateInCopy?: boolean;
}

const DailyView: React.FC<DailyViewProps> = ({ tasks, projects, onUpdateTask, onDeleteTask, onEditTask, setNotification, defaultIncludeDateInCopy = true }) => {
  const [filterDate, setFilterDate] = useState('');
  const [copyModalDate, setCopyModalDate] = useState<string | null>(null);
  const [copyModalProject, setCopyModalProject] = useState<{ projectId: string; date: string } | null>(null);
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

  const handleProjectCopyClick = (projectId: string, date: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the project row from collapsing/expanding
    const projectTasks = (groupedTasks[date] || []).filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) {
      setNotification("No tasks for this project to copy.");
      return;
    }
    setCopyModalProject({ projectId, date });
  };

  const handleProjectCopyTasks = (content: string, projectId: string, date: string) => {
    navigator.clipboard.writeText(content);
    const projectTasks = (groupedTasks[date] || []).filter(t => t.projectId === projectId);
    setNotification(`Copied ${projectTasks.length} task(s) for ${getProjectName(projectId)}!`);
    setCopyModalProject(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">All Tasks</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial sm:w-auto">
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
      </div>

      {copyModalDate && (
        <Modal isOpen={true} onClose={() => setCopyModalDate(null)} title="Copy Tasks">
          <SimpleCopyModal
            tasks={groupedTasks[copyModalDate] || []}
            date={copyModalDate}
            onCopy={(content) => handleCopyTasks(content, copyModalDate)}
            onCancel={() => setCopyModalDate(null)}
            getProjectName={getProjectName}
          />
        </Modal>
      )}

      {copyModalProject && (
        <Modal isOpen={true} onClose={() => setCopyModalProject(null)} title="Copy Tasks">
          <CopyTasksModal
            tasks={(groupedTasks[copyModalProject.date] || []).filter(t => t.projectId === copyModalProject.projectId)}
            date={copyModalProject.date}
            onCopy={(content) => handleProjectCopyTasks(content, copyModalProject.projectId, copyModalProject.date)}
            onCancel={() => setCopyModalProject(null)}
            defaultIncludeDate={defaultIncludeDateInCopy}
          />
        </Modal>
      )}

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
                <button onClick={() => handleCopyClick(date)} className="text-foreground/60 hover:text-primary transition-colors p-1">
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              </div>
              {sortedProjectIds.map(projectId => {
                const isCollapsed = isProjectCollapsed(projectId, date);
                return (
                  <div key={projectId} className="space-y-2">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleProjectCollapse(projectId, date)}
                        className="text-sm font-semibold text-foreground/80 pl-4 border-l-2 border-primary/30 flex items-center gap-2 flex-1 text-left hover:text-primary transition-colors cursor-pointer"
                      >
                        {isCollapsed ? (
                          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                        )}
                        {getProjectName(projectId)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectCopyClick(projectId, date, e);
                          }}
                          className="text-foreground/60 hover:text-primary transition-colors p-1 ml-1"
                          title="Copy project tasks"
                          aria-label="Copy project tasks"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-muted-foreground font-normal">
                          ({tasksByProject[projectId].length})
                        </span>
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="space-y-1 pl-4">
                        {(() => {
                          const tasksForProject = tasksByProject[projectId];
                          const parentTasks = tasksForProject.filter(t => !t.parentTaskId);
                          const subtasksMap = new Map<string, Task[]>();
                          
                          // Group subtasks by parent
                          tasksForProject.forEach(task => {
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