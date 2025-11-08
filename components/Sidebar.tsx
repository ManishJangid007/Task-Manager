
import React, { useRef, useMemo, useState } from 'react';
import { Project, Task, View } from '../types';
import { PlusIcon, CalendarDaysIcon, ChartBarIcon, FolderIcon, PencilIcon, TrashIcon, XMarkIcon, CogIcon, MagnifyingGlassIcon, PinIcon, EllipsisVerticalIcon } from './Icons';
import { ThemeToggle } from './ui/theme-toggle';
import { Badge } from './ui/badge';
import { getTodayDateString } from '../utils/dateUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SidebarProps {
  projects: Project[];
  tasks: Task[];
  view: View;
  setView: (view: View) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onTogglePin: (projectId: string) => void;
  onQuickAddTask: () => void;
  includeCompletedTasks: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, tasks, view, setView, onAddProject, onEditProject, onDeleteProject, onTogglePin, onQuickAddTask, includeCompletedTasks, isOpen, onClose }) => {
    const activeProject = typeof view === 'object' && view.type === 'project' ? view.id : null;
    const [searchQuery, setSearchQuery] = useState('');

    const today = getTodayDateString();
    
    // Filter tasks based on includeCompletedTasks setting
    const filteredTasks = useMemo(() => {
        return includeCompletedTasks 
            ? tasks 
            : tasks.filter(task => !task.isCompleted);
    }, [tasks, includeCompletedTasks]);
    
    // Count all today's tasks across all projects
    const todaysTaskCount = useMemo(() => {
        return filteredTasks.filter(task => task.date === today).length;
    }, [filteredTasks, today]);

    // Count today's tasks for each project
    const projectTodayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.forEach(project => {
            counts[project.id] = filteredTasks.filter(
                task => task.projectId === project.id && task.date === today
            ).length;
        });
        return counts;
    }, [projects, filteredTasks, today]);

    // Filter and sort projects based on search query and pinned status
    const filteredProjects = useMemo(() => {
        let filtered = projects;
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = projects.filter(project => 
                project.name.toLowerCase().includes(query)
            );
        }
        
        // Sort: pinned projects first, then by name
        return [...filtered].sort((a, b) => {
            const aPinned = a.pinned ?? false;
            const bPinned = b.pinned ?? false;
            
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            
            return a.name.localeCompare(b.name);
        });
    }, [projects, searchQuery]);

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
          <h1 className="text-2xl font-bold text-foreground">Chrono</h1>
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
        {/* Search Input */}
        <div className="relative mb-3">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <ul className="space-y-1">
          {filteredProjects.length === 0 ? (
            <li className="px-4 py-2 text-sm text-muted-foreground text-center">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </li>
          ) : (
            filteredProjects.map(project => (
            <li key={project.id} className="group">
               <div className="flex items-center justify-between">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setView({ type: 'project', id: project.id }); }}
                  className={`flex-grow flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeProject === project.id ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'}`}
                >
                  <div className="flex items-center min-w-0">
                    {project.pinned && (
                      <PinIcon className={`mr-2 w-4 h-4 flex-shrink-0 ${activeProject === project.id ? 'text-primary-foreground' : 'text-primary'}`} />
                    )}
                    <FolderIcon className="mr-3 w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <Badge count={projectTodayCounts[project.id] || 0} className="ml-2 flex-shrink-0" />
                </a>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-foreground/60 hover:text-foreground focus:opacity-100 focus:outline-none">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onTogglePin(project.id)}>
                      <PinIcon className="mr-2 w-4 h-4" />
                      {project.pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                      <PencilIcon className="mr-2 w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <TrashIcon className="mr-2 w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
            ))
          )}
        </ul>
      </div>

      <div className="border-t border-border pt-4">
        <button
            onClick={() => setView('settings')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'settings' ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted'}`}
        >
            <CogIcon className="mr-3 w-5 h-5" /> Settings
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
