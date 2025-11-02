
import React, { useRef, useMemo } from 'react';
import { Project, Task, View } from '../types';
import { PlusIcon, CalendarDaysIcon, ChartBarIcon, FolderIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, XMarkIcon } from './Icons';
import { ThemeToggle } from './ui/theme-toggle';
import { Badge } from './ui/badge';
import { getTodayDateString } from '../utils/dateUtils';

interface SidebarProps {
  projects: Project[];
  tasks: Task[];
  view: View;
  setView: (view: View) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onQuickAddTask: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, tasks, view, setView, onAddProject, onEditProject, onDeleteProject, onQuickAddTask, onExport, onImport, isOpen, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeProject = typeof view === 'object' && view.type === 'project' ? view.id : null;

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const today = getTodayDateString();
    
    // Count all today's tasks across all projects
    const todaysTaskCount = useMemo(() => {
        return tasks.filter(task => task.date === today).length;
    }, [tasks, today]);

    // Count today's tasks for each project
    const projectTodayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.forEach(project => {
            counts[project.id] = tasks.filter(
                task => task.projectId === project.id && task.date === today
            ).length;
        });
        return counts;
    }, [projects, tasks, today]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 lg:w-72 bg-card border-r border-border p-4 space-y-6 flex flex-col h-screen shadow-md
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1 text-foreground/60 hover:text-foreground"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      
      <nav className="space-y-2">
        <button
            onClick={() => setView('daily')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'}`}
        >
            <div className="flex items-center">
                <CalendarDaysIcon className="mr-3 w-5 h-5"/> Tasks by Date
            </div>
            <Badge count={todaysTaskCount} />
        </button>
        <button
            onClick={() => setView('reports')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'reports' ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'}`}
        >
            <ChartBarIcon className="mr-3 w-5 h-5"/> Reports
        </button>
        <button
            onClick={onQuickAddTask}
            className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-muted transition-colors"
        >
            <PlusIcon className="mr-3 w-5 h-5"/> Quick Add Tasks
        </button>
      </nav>

      <div className="flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <button onClick={onAddProject} className="p-1 text-foreground/60 hover:text-primary transition-colors">
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
        <ul className="space-y-1">
          {projects.map(project => (
            <li key={project.id} className="group">
               <div className="flex items-center justify-between">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setView({ type: 'project', id: project.id }); }}
                  className={`flex-grow flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeProject === project.id ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'}`}
                >
                  <div className="flex items-center min-w-0">
                    <FolderIcon className="mr-3 w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <Badge count={projectTodayCounts[project.id] || 0} className="ml-2 flex-shrink-0" />
                </a>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2">
                    <button onClick={() => onEditProject(project)} className="p-1 text-foreground/60 hover:text-primary transition-colors">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteProject(project.id)} className="p-1 text-foreground/60 hover:text-destructive transition-colors">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
         <button
            onClick={onExport}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-muted hover:bg-muted/80 transition-colors"
        >
            <ArrowDownTrayIcon className="mr-2 w-5 h-5" /> Export Data
        </button>
         <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-muted hover:bg-muted/80 transition-colors"
        >
            <ArrowUpTrayIcon className="mr-2 w-5 h-5" /> Import Data
        </button>
        <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
