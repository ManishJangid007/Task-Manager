import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Project, Task, View } from './types';
import Sidebar from './components/Sidebar';
import ProjectView from './components/ProjectView';
import DailyView from './components/DailyView';
import ReportsView from './components/ReportsView';
import { getTodayDateString } from './utils/dateUtils';
import { CheckCircleIcon } from './components/Icons';
import Modal from './components/Modal';
import BatchTaskModal from './components/BatchTaskModal';

type ModalState =
  | { type: 'addProject' }
  | { type: 'editProject', project: Project }
  | { type: 'addTask', projectId: string }
  | { type: 'editTask', task: Task }
  | { type: 'batchAddTask' }
  | null;

const ProjectForm: React.FC<{
  onSubmit: (name: string) => void;
  onCancel: () => void;
  project?: Project;
}> = ({ onSubmit, onCancel, project }) => {
  const [name, setName] = useState(project?.name || '');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
        >
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

const TaskForm: React.FC<{
  onSubmit: (title: string, date: string) => void;
  onCancel: () => void;
  task?: Task;
}> = ({ onSubmit, onCancel, task }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [date, setDate] = useState(task?.date || getTodayDateString());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, date);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Title
        </label>
        <input
          type="text"
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="taskDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>
        <input
          type="date"
          id="taskDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
        >
          {task ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};


function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [view, setView] = useState<View>('daily');
  const [notification, setNotification] = useState<string>('');
  const [modalState, setModalState] = useState<ModalState>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddProjectClick = () => setModalState({ type: 'addProject' });
  const handleEditProjectClick = (project: Project) => setModalState({ type: 'editProject', project });
  const handleAddTaskClick = (projectId: string) => setModalState({ type: 'addTask', projectId });
  const handleEditTaskClick = (task: Task) => setModalState({ type: 'editTask', task });
  const handleQuickAddTaskClick = () => setModalState({ type: 'batchAddTask' });

  const handleCreateProject = (name: string) => {
    if (name && name.trim() !== '') {
      const newProject: Project = { id: `proj_${Date.now()}`, name: name.trim() };
      setProjects([...projects, newProject]);
      setModalState(null);
    }
  };

  const handleUpdateProject = (projectId: string, newName: string) => {
    if (newName && newName.trim() !== '') {
      setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName.trim() } : p));
      setModalState(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project and all its tasks? This action cannot be undone.')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setTasks(tasks.filter(t => t.projectId !== projectId));
      
      if (typeof view === 'object' && view.type === 'project' && view.id === projectId) {
        setView('daily');
      }
      setNotification('Project deleted successfully.');
    }
  };

  const handleCreateTask = (title: string, projectId: string, date: string) => {
    if (title && title.trim() !== '') {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        projectId,
        title: title.trim(),
        date: date,
        isCompleted: false,
      };
      setTasks([...tasks, newTask]);
      setModalState(null);
    }
  };
  
  const handleBatchCreateTasks = (newTasks: Array<{ title: string; projectId: string }>) => {
    const tasksToAdd: Task[] = newTasks.map((t, i) => ({
      id: `task_${Date.now()}_${i}`,
      projectId: t.projectId,
      title: t.title,
      date: getTodayDateString(),
      isCompleted: false,
    }));

    if(tasksToAdd.length > 0) {
      setTasks(prevTasks => [...prevTasks, ...tasksToAdd]);
      setNotification(`${tasksToAdd.length} task(s) added successfully!`);
    }
    setModalState(null);
  };


  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    if (modalState?.type === 'editTask') {
      setModalState(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ projects, tasks }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification('Data exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const { projects: importedProjects, tasks: importedTasks } = JSON.parse(text);
          if (Array.isArray(importedProjects) && Array.isArray(importedTasks)) {
            if (window.confirm('This will overwrite your current data. Are you sure?')) {
              setProjects(importedProjects);
              setTasks(importedTasks);
              setNotification('Data imported successfully!');
              setView('daily');
            }
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };


  const renderView = () => {
    if (view === 'daily') {
      return <DailyView tasks={tasks} projects={projects} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onEditTask={handleEditTaskClick} setNotification={setNotification} />;
    }
    if (view === 'reports') {
      return <ReportsView tasks={tasks} projects={projects} />;
    }
    if (typeof view === 'object' && view.type === 'project') {
      const project = projects.find(p => p.id === view.id);
      if (!project) {
        setView('daily');
        return null;
      }
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      return <ProjectView project={project} tasks={projectTasks} onAddTask={handleAddTaskClick} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onEditTask={handleEditTaskClick} setNotification={setNotification} />;
    }
    return null;
  };

  const renderModal = () => {
    if (!modalState) return null;

    switch (modalState.type) {
      case 'addProject':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Add New Project">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'editProject':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Edit Project">
            <ProjectForm
              project={modalState.project}
              onSubmit={(name) => handleUpdateProject(modalState.project.id, name)}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'addTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Add New Task">
            <TaskForm
              onSubmit={(title, date) => handleCreateTask(title, modalState.projectId, date)}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'editTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Edit Task">
            <TaskForm
              task={modalState.task}
              onSubmit={(title, date) => handleUpdateTask({ ...modalState.task, title, date })}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'batchAddTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Quick Add Tasks">
            <BatchTaskModal
              projects={projects}
              onSubmit={handleBatchCreateTasks}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      default:
        return null;
    }
  };


  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        projects={projects}
        view={view}
        setView={setView}
        onAddProject={handleAddProjectClick}
        onEditProject={handleEditProjectClick}
        onDeleteProject={handleDeleteProject}
        onQuickAddTask={handleQuickAddTaskClick}
        onExport={handleExport}
        onImport={handleImport}
      />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
        {renderModal()}
      </main>

      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;