import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Project, Task, View, ProjectSortOrder, TaskPriority, Configuration, Key } from './types';
import Sidebar from './components/Sidebar';
import ProjectView from './components/ProjectView';
import DailyView from './components/DailyView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ConfigurationView from './components/ConfigurationView';
import KeysView from './components/KeysView';
import { 
  saveBackupFile, 
  downloadBackupFile, 
  isFileSystemAccessSupported,
  getBackupConfig,
  verifyPermission,
  type BackupConfig 
} from './utils/fileSystemAccess';
import { getTodayDateString } from './utils/dateUtils';
import { CheckCircleIcon, BarsIcon, PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from './components/Icons';
import Modal from './components/Modal';
import BatchTaskModal from './components/BatchTaskModal';
import ProjectBatchTaskModal from './components/ProjectBatchTaskModal';
import { DatePicker } from './components/ui/date-picker';
import { Select } from './components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';

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
        <label htmlFor="projectName" className="block text-sm font-medium text-foreground">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none transition-colors"
        >
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

const TaskForm: React.FC<{
  onSubmit: (title: string, date: string, priority: TaskPriority) => void;
  onCancel: () => void;
  task?: Task;
}> = ({ onSubmit, onCancel, task }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [date, setDate] = useState(task?.date || getTodayDateString());
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!task;

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <PriorityHighIcon className="w-4 h-4" />;
      case 'medium':
        return <PriorityMediumIcon className="w-4 h-4" />;
      case 'low':
        return <PriorityLowIcon className="w-4 h-4" />;
      default:
        return <PriorityMediumIcon className="w-4 h-4" />;
    }
  };

  const priorityOptions = [
    { value: 'high', label: 'High', icon: getPriorityIcon('high') },
    { value: 'medium', label: 'Medium', icon: getPriorityIcon('medium') },
    { value: 'low', label: 'Low', icon: getPriorityIcon('low') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, date, priority);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Shift+Enter allows default behavior (new line in textarea)
  };

  useEffect(() => {
    // Adjust height when component mounts or title changes
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="taskTitle" className="block text-sm font-medium text-foreground">
          Task Title
        </label>
        <textarea
          ref={textareaRef}
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground resize-none min-h-[2.5rem]"
          required
          autoFocus
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>
      <div>
        <label htmlFor="taskPriority" className="block text-sm font-medium text-foreground mb-2">
          Priority
        </label>
        <Select
          value={priority}
          onChange={(value) => setPriority(value as TaskPriority)}
          options={priorityOptions}
          placeholder="Select priority..."
          className="w-full"
          showIconInField={true}
          showIconInDropdown={true}
          iconOnlyInField={!isEditMode}
        />
      </div>
      <div>
        <label htmlFor="taskDate" className="block text-sm font-medium text-foreground mb-2">
          Date
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Pick a date"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none transition-colors"
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
  const [configurations, setConfigurations] = useLocalStorage<Configuration[]>('configurations', []);
  const [keys, setKeys] = useLocalStorage<Key[]>('keys', []);
  const [includeCompletedTasks, setIncludeCompletedTasks] = useLocalStorage<boolean>('includeCompletedTasks', true);
  const [projectSortOrder, setProjectSortOrder] = useLocalStorage<ProjectSortOrder>('projectSortOrder', 'alphabetical');
  const [askForTaskDeleteConfirmation, setAskForTaskDeleteConfirmation] = useLocalStorage<boolean>('askForTaskDeleteConfirmation', true);
  const [defaultIncludeDateInCopy, setDefaultIncludeDateInCopy] = useLocalStorage<boolean>('defaultIncludeDateInCopy', true);
  const [view, setView] = useState<View>('daily');
  const [notification, setNotification] = useState<string>('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'project' | 'task'; id: string } | null>(null);
  const [importDialog, setImportDialog] = useState<{ projects: Project[]; tasks: Task[]; configurations?: Configuration[]; keys?: Key[] } | null>(null);
  const [backupConfig, setBackupConfig] = useState<BackupConfig | null>(null);

  // Load backup config on app start
  useEffect(() => {
    const loadBackupConfig = async () => {
      try {
        const config = await getBackupConfig();
        setBackupConfig(config);
      } catch (error) {
        console.error('Failed to load backup config:', error);
      }
    };
    loadBackupConfig();
  }, []);

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
      setView({ type: 'project', id: newProject.id });
    }
  };

  const handleUpdateProject = (projectId: string, newName: string) => {
    if (newName && newName.trim() !== '') {
      setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName.trim() } : p));
      setModalState(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteDialog({ type: 'project', id: projectId });
  };

  const confirmDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.projectId !== projectId));
    setConfigurations(configurations.filter(c => c.projectId !== projectId));

    if (typeof view === 'object' && (view.type === 'project' && view.id === projectId || view.type === 'configuration' && view.projectId === projectId)) {
      setView('daily');
    }
    setNotification('Project deleted successfully.');
    setDeleteDialog(null);
  };

  const handleTogglePin = (projectId: string) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, pinned: !p.pinned } : p
    ));
  };

  const handleCreateTask = (title: string, projectId: string, date: string, priority: TaskPriority) => {
    if (title && title.trim() !== '') {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        projectId,
        title: title.trim(),
        date: date,
        isCompleted: false,
        priority: priority,
      };
      setTasks([...tasks, newTask]);
      setModalState(null);
    }
  };

  const handleBatchCreateTasks = (newTasks: Array<{ title: string; projectId: string; priority: TaskPriority; parentTaskId?: string }>) => {
    const timestamp = Date.now();
    const parentTasks: Task[] = [];
    const subtasks: Array<{ title: string; projectId: string; priority: TaskPriority; parentTaskId: string }> = [];
    
    // Separate parent tasks and subtasks
    newTasks.forEach((t, i) => {
      if (t.parentTaskId && t.parentTaskId.startsWith('__parent_index_')) {
        // This is a subtask with a temporary parent index
        const parentIndex = parseInt(t.parentTaskId.replace('__parent_index_', '').replace('__', ''));
        subtasks.push({
          title: t.title,
          projectId: t.projectId,
          priority: t.priority,
          parentTaskId: `__parent_index_${parentIndex}__`
        });
      } else if (!t.parentTaskId) {
        // This is a parent task
        parentTasks.push({
          id: `task_${timestamp}_${i}`,
          projectId: t.projectId,
          title: t.title,
          date: getTodayDateString(),
          isCompleted: false,
          priority: t.priority,
        });
      }
    });
    
    // Create a map from parent index to parent task ID
    const parentIndexToId = new Map<number, string>();
    parentTasks.forEach((task, index) => {
      parentIndexToId.set(index, task.id);
    });
    
    // Create subtasks with actual parent task IDs
    const subtasksToAdd: Task[] = subtasks.map((st, i) => {
      const parentIndex = parseInt(st.parentTaskId.replace('__parent_index_', '').replace('__', ''));
      const parentId = parentIndexToId.get(parentIndex);
      return {
        id: `task_${timestamp}_sub_${i}`,
        projectId: st.projectId,
        title: st.title,
        date: getTodayDateString(),
        isCompleted: false,
        priority: st.priority,
        parentTaskId: parentId,
      };
    });
    
    const allTasksToAdd = [...parentTasks, ...subtasksToAdd];
    
    if (allTasksToAdd.length > 0) {
      setTasks(prevTasks => [...prevTasks, ...allTasksToAdd]);
      setNotification(`${allTasksToAdd.length} task(s) added successfully!`);
    }
    setModalState(null);
  };

  const handleProjectBatchCreateTasks = (projectId: string, newTasks: Array<{ title: string; date: string; priority: TaskPriority; parentTaskId?: string }>) => {
    const timestamp = Date.now();
    const parentTasks: Task[] = [];
    const subtasks: Array<{ title: string; date: string; priority: TaskPriority; parentTaskId: string }> = [];
    
    // Separate parent tasks and subtasks
    newTasks.forEach((t, i) => {
      if (t.parentTaskId && t.parentTaskId.startsWith('__parent_index_')) {
        // This is a subtask with a temporary parent index
        const parentIndex = parseInt(t.parentTaskId.replace('__parent_index_', '').replace('__', ''));
        subtasks.push({
          title: t.title,
          date: t.date,
          priority: t.priority,
          parentTaskId: `__parent_index_${parentIndex}__`
        });
      } else if (!t.parentTaskId) {
        // This is a parent task
        parentTasks.push({
          id: `task_${timestamp}_${i}`,
          projectId: projectId,
          title: t.title,
          date: t.date,
          isCompleted: false,
          priority: t.priority,
        });
      }
    });
    
    // Create a map from parent index to parent task ID
    const parentIndexToId = new Map<number, string>();
    parentTasks.forEach((task, index) => {
      parentIndexToId.set(index, task.id);
    });
    
    // Create subtasks with actual parent task IDs
    const subtasksToAdd: Task[] = subtasks.map((st, i) => {
      const parentIndex = parseInt(st.parentTaskId.replace('__parent_index_', '').replace('__', ''));
      const parentId = parentIndexToId.get(parentIndex);
      return {
        id: `task_${timestamp}_sub_${i}`,
        projectId: projectId,
        title: st.title,
        date: st.date,
        isCompleted: false,
        priority: st.priority,
        parentTaskId: parentId,
      };
    });
    
    const allTasksToAdd = [...parentTasks, ...subtasksToAdd];
    
    if (allTasksToAdd.length > 0) {
      setTasks(prevTasks => [...prevTasks, ...allTasksToAdd]);
      setNotification(`${allTasksToAdd.length} task(s) added successfully!`);
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
    if (askForTaskDeleteConfirmation) {
      setDeleteDialog({ type: 'task', id: taskId });
    } else {
      // Delete task and all its subtasks
      const taskIdsToDelete = new Set([taskId]);
      tasks.forEach(task => {
        if (task.parentTaskId === taskId) {
          taskIdsToDelete.add(task.id);
        }
      });
      setTasks(tasks.filter(task => !taskIdsToDelete.has(task.id)));
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    // Delete task and all its subtasks
    const taskIdsToDelete = new Set([taskId]);
    tasks.forEach(task => {
      if (task.parentTaskId === taskId) {
        taskIdsToDelete.add(task.id);
      }
    });
    setTasks(tasks.filter(task => !taskIdsToDelete.has(task.id)));
    setDeleteDialog(null);
  };

  const handleExport = () => {
    const data = JSON.stringify({ projects, tasks, configurations, keys }, null, 2);
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
          const parsed = JSON.parse(text);
          const { projects: importedProjects, tasks: importedTasks, configurations: importedConfigurations, keys: importedKeys } = parsed;
          if (Array.isArray(importedProjects) && Array.isArray(importedTasks)) {
            setImportDialog({ 
              projects: importedProjects, 
              tasks: importedTasks,
              configurations: Array.isArray(importedConfigurations) ? importedConfigurations : [],
              keys: Array.isArray(importedKeys) ? importedKeys : []
            });
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

  const confirmImport = () => {
    if (importDialog) {
      setProjects(importDialog.projects);
      setTasks(importDialog.tasks);
      if (importDialog.configurations) {
        setConfigurations(importDialog.configurations);
      }
      if (importDialog.keys) {
        setKeys(importDialog.keys);
      }
      setNotification('Data imported successfully!');
      setView('daily');
      setImportDialog(null);
    }
  };

  const handleOpenConfiguration = (projectId: string) => {
    setView({ type: 'configuration', projectId });
  };

  const handleAddConfiguration = (config: Omit<Configuration, 'id'>) => {
    const newConfig: Configuration = {
      id: `config_${Date.now()}`,
      ...config,
    };
    setConfigurations([...configurations, newConfig]);
  };

  const handleUpdateConfiguration = (updatedConfig: Configuration) => {
    setConfigurations(configurations.map(config => 
      config.id === updatedConfig.id ? updatedConfig : config
    ));
  };

  const handleDeleteConfiguration = (configId: string) => {
    setConfigurations(configurations.filter(config => config.id !== configId));
  };

  const handleAddKey = (key: Omit<Key, 'id'>) => {
    const newKey: Key = {
      id: `key_${Date.now()}`,
      ...key,
    };
    setKeys([...keys, newKey]);
  };

  const handleUpdateKey = (updatedKey: Key) => {
    setKeys(keys.map(key => 
      key.id === updatedKey.id ? updatedKey : key
    ));
  };

  const handleDeleteKey = (keyId: string) => {
    setKeys(keys.filter(key => key.id !== keyId));
  };

  const handleBackupConfigChange = (config: BackupConfig) => {
    setBackupConfig(config);
  };

  // Keyboard shortcut handler for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleAutoBackup = async () => {
      try {
        const data = JSON.stringify({ projects, tasks, configurations, keys }, null, 2);
        
        // Check if File System Access API is supported
        if (!isFileSystemAccessSupported()) {
          // Fallback to download
          downloadBackupFile(data, 'backup.json');
          setNotification('Backup downloaded (File System Access API not supported)');
          return;
        }
        
        // Get current backup config (in case it was updated)
        let currentConfig = backupConfig;
        if (!currentConfig) {
          currentConfig = await getBackupConfig();
          setBackupConfig(currentConfig);
        }
        
        if (currentConfig?.directoryHandle) {
          // Use File System Access API
          try {
            await saveBackupFile(currentConfig.directoryHandle, data, 'backup.json');
            setNotification('Backup saved successfully!');
            return;
          } catch (error: any) {
            console.error('Failed to save backup:', error);
            
            // If permission error, try to reload config and request permission again
            if (error.message?.includes('Permission') || error.message?.includes('denied')) {
              const reloadedConfig = await getBackupConfig();
              if (reloadedConfig?.directoryHandle) {
                try {
                  // Try to verify and request permission again
                  const hasPermission = await verifyPermission(reloadedConfig.directoryHandle);
                  if (hasPermission) {
                    await saveBackupFile(reloadedConfig.directoryHandle, data, 'backup.json');
                    setBackupConfig(reloadedConfig);
                    setNotification('Backup saved successfully!');
                    return;
                  }
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                }
              }
            }
            
            // Fallback to download if permission is lost
            downloadBackupFile(data, 'backup.json');
            setNotification('Backup downloaded (folder access lost, please reselect folder in Settings)');
            return;
          }
        }
        
        // No folder selected, fallback to download
        downloadBackupFile(data, 'backup.json');
        setNotification('Backup downloaded (select a folder in Settings to enable auto-save)');
      } catch (error) {
        console.error('Backup failed:', error);
        setNotification('Failed to create backup');
      }
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        await handleAutoBackup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects, tasks, configurations, keys, backupConfig]);

  const renderView = () => {
    if (view === 'daily') {
      return <DailyView tasks={tasks} projects={projects} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onEditTask={handleEditTaskClick} setNotification={setNotification} defaultIncludeDateInCopy={defaultIncludeDateInCopy} />;
    }
    if (view === 'reports') {
      return <ReportsView tasks={tasks} projects={projects} />;
    }
    if (view === 'keys') {
      return <KeysView keys={keys} onAddKey={handleAddKey} onUpdateKey={handleUpdateKey} onDeleteKey={handleDeleteKey} setNotification={setNotification} />;
    }
    if (view === 'settings') {
      return <SettingsView onExport={handleExport} onImport={handleImport} includeCompletedTasks={includeCompletedTasks} onIncludeCompletedTasksChange={setIncludeCompletedTasks} projectSortOrder={projectSortOrder} onProjectSortOrderChange={setProjectSortOrder} askForTaskDeleteConfirmation={askForTaskDeleteConfirmation} onAskForTaskDeleteConfirmationChange={setAskForTaskDeleteConfirmation} defaultIncludeDateInCopy={defaultIncludeDateInCopy} onDefaultIncludeDateInCopyChange={setDefaultIncludeDateInCopy} onBackupConfigChange={handleBackupConfigChange} />;
    }
    if (typeof view === 'object' && view.type === 'project') {
      const project = projects.find(p => p.id === view.id);
      if (!project) {
        setView('daily');
        return null;
      }
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      return <ProjectView project={project} tasks={projectTasks} onAddTask={handleAddTaskClick} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onEditTask={handleEditTaskClick} setNotification={setNotification} defaultIncludeDateInCopy={defaultIncludeDateInCopy} onOpenConfiguration={handleOpenConfiguration} />;
    }
    if (typeof view === 'object' && view.type === 'configuration') {
      const project = projects.find(p => p.id === view.projectId);
      if (!project) {
        setView('daily');
        return null;
      }
      const projectConfigurations = configurations.filter(c => c.projectId === project.id);
      return (
        <ConfigurationView
          project={project}
          configurations={projectConfigurations}
          onAddConfiguration={handleAddConfiguration}
          onUpdateConfiguration={handleUpdateConfiguration}
          onDeleteConfiguration={handleDeleteConfiguration}
          onBack={() => setView({ type: 'project', id: project.id })}
          setNotification={setNotification}
        />
      );
    }
    return null;
  };

  const renderModal = () => {
    if (!modalState) return null;

    switch (modalState.type) {
      case 'addProject':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Add New Project" size="large">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'editProject':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Edit Project" size="large">
            <ProjectForm
              project={modalState.project}
              onSubmit={(name) => handleUpdateProject(modalState.project.id, name)}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'addTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Add New Tasks" size="large">
            <ProjectBatchTaskModal
              projectId={modalState.projectId}
              onSubmit={(tasks) => handleProjectBatchCreateTasks(modalState.projectId, tasks)}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'editTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Edit Task" size="large">
            <TaskForm
              task={modalState.task}
              onSubmit={(title, date, priority) => handleUpdateTask({ ...modalState.task, title, date, priority })}
              onCancel={() => setModalState(null)}
            />
          </Modal>
        );
      case 'batchAddTask':
        return (
          <Modal isOpen={true} onClose={() => setModalState(null)} title="Add Tasks" size="large">
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
        tasks={tasks}
        view={view}
        setView={(newView) => {
          setView(newView);
          setSidebarOpen(false); // Close sidebar on mobile when navigating
        }}
        onAddProject={handleAddProjectClick}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProjectClick}
        onDeleteProject={handleDeleteProject}
        onTogglePin={handleTogglePin}
        onQuickAddTask={handleQuickAddTaskClick}
        includeCompletedTasks={includeCompletedTasks}
        projectSortOrder={projectSortOrder}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-card border border-border rounded-md text-foreground hover:bg-accent shadow-md"
        >
          <BarsIcon className="w-5 h-5" />
        </button>
        <div className="md:pl-0 pt-14 md:pt-0">
          {renderView()}
          {renderModal()}
        </div>
      </main>

      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {notification}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog?.type === 'project' ? 'Delete Project' : 'Delete Task'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === 'project'
                ? 'Are you sure you want to delete this project and all its tasks? This action cannot be undone.'
                : 'Are you sure you want to delete this task? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog?.type === 'project') {
                  confirmDeleteProject(deleteDialog.id);
                } else if (deleteDialog?.type === 'task') {
                  confirmDeleteTask(deleteDialog.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={importDialog !== null} onOpenChange={(open) => !open && setImportDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite your current data. Are you sure you want to continue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;