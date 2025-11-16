import React, { useState, useRef, useEffect } from 'react';
import { Project, TaskPriority } from '../types';
import { PlusIcon, TrashIcon, PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from './Icons';
import { Combobox } from './ui/combobox';
import { Select } from './ui/select';

interface BatchTaskModalProps {
  projects: Project[];
  onSubmit: (tasks: Array<{ title: string; projectId: string; priority: TaskPriority; parentTaskId?: string }>) => void;
  onCancel: () => void;
}

type TaskRow = {
  id: number;
  title: string;
  projectId: string;
  priority: TaskPriority;
  parentTaskId?: number; // ID of parent row (for subtasks)
};

const BatchTaskModal: React.FC<BatchTaskModalProps> = ({ projects, onSubmit, onCancel }) => {
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { id: Date.now(), title: '', projectId: projects[0]?.id || '', priority: 'medium' },
  ]);
  const inputsRef = useRef<(HTMLTextAreaElement | null)[]>([]);

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

  // Removed useEffect - focus is now handled in handleAddRow when inserting at specific index

  const handleAddRow = (preserveSubtaskStatus = false, insertAfterIndex?: number, explicitParentTaskId?: number) => {
    const targetIndex = insertAfterIndex !== undefined ? insertAfterIndex : taskRows.length - 1;
    const targetRow = taskRows[targetIndex];
    
    // Don't add a new row if the target row's title is empty
    if (targetRow && !targetRow.title.trim()) {
      return;
    }
    
    const lastProject = targetRow?.projectId || projects[0]?.id || '';
    const lastPriority = targetRow?.priority || 'medium';
    
    // Create new row
    const newRow: TaskRow = {
      id: Date.now(),
      title: '',
      projectId: lastProject,
      priority: lastPriority,
    };
    
    // Determine parent task ID
    if (explicitParentTaskId !== undefined) {
      // Explicit parent task ID provided (e.g., when parent has subtasks)
      newRow.parentTaskId = explicitParentTaskId;
    } else if (preserveSubtaskStatus && targetRow?.parentTaskId) {
      // Preserve the same parent task ID for the new subtask
      newRow.parentTaskId = targetRow.parentTaskId;
    }
    
    if (insertAfterIndex !== undefined) {
      // Insert after the specified index
      const newRows = [...taskRows];
      newRows.splice(insertAfterIndex + 1, 0, newRow);
      setTaskRows(newRows);
      // Focus the newly inserted input after state update
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          const insertedIndex = insertAfterIndex + 1;
          if (inputsRef.current[insertedIndex]) {
            inputsRef.current[insertedIndex].focus();
          }
        }, 0);
      });
    } else {
      // Add at the end
      setTaskRows([...taskRows, newRow]);
      // Focus the last input when adding at the end
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (inputsRef.current.length > 0) {
            const lastInput = inputsRef.current[inputsRef.current.length - 1];
            lastInput?.focus();
          }
        }, 0);
      });
    }
  };

  const handleMakeSubtask = (rowIndex: number) => {
    if (rowIndex === 0) return; // Can't make first row a subtask
    
    const currentRow = taskRows[rowIndex];
    
    // If already a subtask (has any parent), unindent it
    if (currentRow.parentTaskId) {
      // Find the parent row to get its project
      const parentRow = taskRows.find(r => r.id === currentRow.parentTaskId);
      setTaskRows(taskRows.map((row, idx) => 
        idx === rowIndex ? { ...row, parentTaskId: undefined, projectId: parentRow?.projectId || row.projectId } : row
      ));
    } else {
      // Find the nearest parent task (not a subtask) in the previous rows
      let parentRowIndex = -1;
      for (let i = rowIndex - 1; i >= 0; i--) {
        if (!taskRows[i].parentTaskId) {
          // Found a parent task (not a subtask)
          parentRowIndex = i;
          break;
        }
      }
      
      if (parentRowIndex === -1) {
        // No parent task found, can't make it a subtask
        return;
      }
      
      const parentRow = taskRows[parentRowIndex];
      // Make it a subtask of the found parent task
      setTaskRows(taskRows.map((row, idx) => 
        idx === rowIndex ? { ...row, parentTaskId: parentRow.id, projectId: parentRow.projectId } : row
      ));
    }
  };

  const handleRemoveRow = (id: number) => {
    // Prevent deleting the last row
    if (taskRows.length <= 1) {
      return;
    }
    
    const rowToDelete = taskRows.find(row => row.id === id);
    if (!rowToDelete) {
      return;
    }
    
    // Check if this is a parent task (not a subtask)
    const isParentTask = !rowToDelete.parentTaskId;
    
    if (isParentTask) {
      // Count remaining parent tasks after deletion
      const remainingParentTasks = taskRows.filter(row => 
        row.id !== id && !row.parentTaskId
      );
      
      // Prevent deleting if this would be the last parent task
      if (remainingParentTasks.length === 0) {
        return;
      }
    }
    
    // Find all subtasks of this row
    const subtaskIds = new Set([id]);
    taskRows.forEach(row => {
      if (row.parentTaskId === id) {
        subtaskIds.add(row.id);
      }
    });
    
    // Remove the row and all its subtasks
    setTaskRows(taskRows.filter(row => !subtaskIds.has(row.id)));
  };

  const handleRowChange = (id: number, field: 'title' | 'projectId' | 'priority', value: string) => {
    setTaskRows(
      taskRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, rowIndex: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleMakeSubtask(rowIndex);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Always prevent default to avoid newline
      const currentRow = taskRows[rowIndex];
      if (currentRow.title.trim()) {
        // Check if current row is a parent task with subtasks
        const subtasks = taskRows.filter(row => row.parentTaskId === currentRow.id);
        const hasSubtasks = subtasks.length > 0;
        
        // Determine if new row should be a subtask and where to insert
        let shouldBeSubtask = false;
        let parentTaskId: number | undefined = undefined;
        let insertIndex = rowIndex;
        
        if (currentRow.parentTaskId) {
          // Current row is already a subtask, preserve that status
          shouldBeSubtask = true;
          parentTaskId = currentRow.parentTaskId;
          insertIndex = rowIndex; // Insert right after current subtask
        } else if (hasSubtasks) {
          // Current row is a parent with subtasks, add as subtask
          shouldBeSubtask = true;
          parentTaskId = currentRow.id;
          // Find the last subtask of this parent and insert after it
          let lastSubtaskIndex = -1;
          for (let i = taskRows.length - 1; i >= 0; i--) {
            if (taskRows[i].parentTaskId === currentRow.id) {
              lastSubtaskIndex = i;
              break;
            }
          }
          if (lastSubtaskIndex !== -1) {
            insertIndex = lastSubtaskIndex;
          } else {
            insertIndex = rowIndex; // Fallback: insert after parent
          }
        }
        
        // Insert the new row at the calculated index
        handleAddRow(shouldBeSubtask, insertIndex, parentTaskId);
      } else {
        // If empty, submit the form
        const form = e.currentTarget.closest('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
    }
    // Shift+Enter allows default behavior (new line in textarea)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter valid rows and prepare for submission
    // We'll submit parent tasks first, then subtasks
    const validRows = taskRows.filter(row => row.title.trim() !== '' && row.projectId);
    const parentRows = validRows.filter(row => !row.parentTaskId);
    const subtaskRows = validRows.filter(row => row.parentTaskId);
    
    // Create a map from row ID to parent row index
    const rowIdToParentIndex = new Map<number, number>();
    parentRows.forEach((parentRow, index) => {
      rowIdToParentIndex.set(parentRow.id, index);
    });
    
    // Submit parent tasks first
    const tasksToSubmit: Array<{ title: string; projectId: string; priority: TaskPriority; parentTaskId?: string }> = [];
    parentRows.forEach(row => {
      tasksToSubmit.push({ 
        title: row.title, 
        projectId: row.projectId, 
        priority: row.priority 
      });
    });
    
    // Submit subtasks with temporary parent index (will be resolved in App.tsx)
    subtaskRows.forEach(row => {
      const parentIndex = rowIdToParentIndex.get(row.parentTaskId!);
      if (parentIndex !== undefined) {
        tasksToSubmit.push({ 
          title: row.title, 
          projectId: row.projectId, 
          priority: row.priority,
          parentTaskId: `__parent_index_${parentIndex}__` // Temporary marker
        });
      }
    });
    
    onSubmit(tasksToSubmit);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">You need to create a project first before adding tasks.</p>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 min-h-0">
        {taskRows.map((row, index) => {
          const isSubtask = !!row.parentTaskId;
          return (
            <div key={row.id} className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 ${isSubtask ? 'pl-4 sm:pl-6' : ''}`}>
              {!isSubtask && (
                <div className="flex-1 sm:flex-none sm:w-1/4">
                  <Combobox
                    value={row.projectId}
                    onChange={(value) => handleRowChange(row.id, 'projectId', value)}
                    options={projects.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="Select project..."
                    searchPlaceholder="Search projects..."
                    className="w-full"
                  />
                </div>
              )}
              {isSubtask && <div className="flex-1 sm:flex-none sm:w-1/4" />}
              <textarea
                ref={el => { inputsRef.current[index] = el; }}
                placeholder={isSubtask ? "Subtask (Tab: unindent)" : "Task (Tab: subtask)"}
                value={row.title}
                onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                rows={1}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground resize-none min-h-[2.5rem] sm:min-h-[2.25rem]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <div className="flex-1 sm:flex-none sm:w-1/4">
                <Select
                  value={row.priority}
                  onChange={(value) => handleRowChange(row.id, 'priority', value as TaskPriority)}
                  options={priorityOptions}
                  placeholder="Priority..."
                  className="w-full h-9"
                  showIconInField={true}
                  showIconInDropdown={true}
                  iconOnlyInField={false}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRow(row.id)}
                disabled={(() => {
                  if (taskRows.length <= 1) return true;
                  // Check if this is the last parent task
                  const isParentTask = !row.parentTaskId;
                  if (isParentTask) {
                    const remainingParentTasks = taskRows.filter(r => r.id !== row.id && !r.parentTaskId);
                    return remainingParentTasks.length === 0;
                  }
                  return false;
                })()}
                className={`self-start sm:self-auto px-3 py-2.5 sm:px-2 sm:py-1 rounded-md transition-colors ${(() => {
                  if (taskRows.length <= 1) return 'text-foreground/20 cursor-not-allowed opacity-50';
                  const isParentTask = !row.parentTaskId;
                  if (isParentTask) {
                    const remainingParentTasks = taskRows.filter(r => r.id !== row.id && !r.parentTaskId);
                    if (remainingParentTasks.length === 0) return 'text-foreground/20 cursor-not-allowed opacity-50';
                  }
                  return 'text-foreground/60 hover:text-destructive hover:bg-muted';
                })()}`}
                aria-label="Remove task"
                title={(() => {
                  if (taskRows.length <= 1) return 'At least one task row is required';
                  const isParentTask = !row.parentTaskId;
                  if (isParentTask) {
                    const remainingParentTasks = taskRows.filter(r => r.id !== row.id && !r.parentTaskId);
                    if (remainingParentTasks.length === 0) return 'Cannot delete the last parent task';
                  }
                  return 'Remove task';
                })()}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0 space-y-4">
        <button
          type="button"
          onClick={() => {
            const lastRow = taskRows[taskRows.length - 1];
            const isSubtask = !!lastRow?.parentTaskId;
            handleAddRow(isSubtask, taskRows.length - 1, lastRow?.parentTaskId);
          }}
          disabled={taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim()}
          className={`w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium rounded-md transition-colors ${taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim()
            ? 'text-foreground/40 bg-muted/50 cursor-not-allowed opacity-50'
            : 'text-primary bg-muted hover:bg-muted/80'
            }`}
          title={taskRows.length > 0 && !taskRows[taskRows.length - 1].title.trim() ? 'Please fill in the task title above before adding another' : 'Add another task'}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Another Task
        </button>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium bg-primary text-primary-foreground border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none transition-colors"
          >
            Add All Tasks
          </button>
        </div>
      </div>
    </form>
  );
};

export default BatchTaskModal;