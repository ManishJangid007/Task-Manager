
import React, { useRef } from 'react';
import { Project, View } from '../types';
import { PlusIcon, CalendarDaysIcon, ChartBarIcon, FolderIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from './Icons';

interface SidebarProps {
  projects: Project[];
  view: View;
  setView: (view: View) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onQuickAddTask: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, view, setView, onAddProject, onEditProject, onDeleteProject, onQuickAddTask, onExport, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeProject = typeof view === 'object' && view.type === 'project' ? view.id : null;

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-gray-800 p-4 space-y-6 flex flex-col h-screen shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
      
      <nav className="space-y-2">
        <button
            onClick={() => setView('daily')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            <CalendarDaysIcon className="mr-3 w-5 h-5"/> Tasks by Date
        </button>
        <button
            onClick={() => setView('reports')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'reports' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            <ChartBarIcon className="mr-3 w-5 h-5"/> Reports
        </button>
        <button
            onClick={onQuickAddTask}
            className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <PlusIcon className="mr-3 w-5 h-5"/> Quick Add Tasks
        </button>
      </nav>

      <div className="flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
            <button onClick={onAddProject} className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
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
                  className={`flex-grow flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeProject === project.id ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FolderIcon className="mr-3 w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </a>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2">
                    <button onClick={() => onEditProject(project)} className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteProject(project.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
         <button
            onClick={onExport}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
            <ArrowDownTrayIcon className="mr-2 w-5 h-5" /> Export Data
        </button>
         <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
            <ArrowUpTrayIcon className="mr-2 w-5 h-5" /> Import Data
        </button>
        <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />
      </div>
    </aside>
  );
};

export default Sidebar;
