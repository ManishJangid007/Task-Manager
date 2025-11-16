import React from 'react';
import { Task } from '../types';
import { Label } from './ui/label';
import { getTodayDateString } from '../utils/dateUtils';

type CopyFormat = 'normal' | 'withStatus';

interface SimpleCopyModalProps {
    tasks: Task[];
    date: string;
    onCopy: (content: string) => void;
    onCancel: () => void;
    getProjectName: (projectId: string) => string;
}

const SimpleCopyModal: React.FC<SimpleCopyModalProps> = ({ tasks, date, onCopy, onCancel, getProjectName }) => {
    const getFormattedDate = () => {
        const dateObj = new Date(date + 'T00:00:00');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const dayOfMonth = dateObj.getDate().toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${month}-${dayOfMonth}-${year}`;
    };

    const generateContent = (format: CopyFormat): string => {
        const formattedDate = getFormattedDate();
        const isToday = date === getTodayDateString();

        // Group tasks by project
        const tasksByProject = tasks.reduce((acc, task) => {
            if (!acc[task.projectId]) {
                acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
        }, {} as Record<string, Task[]>);

        // Build content
        let content = '';

        if (format === 'withStatus') {
            content = `Updates [${formattedDate}]\n`;
        } else {
            content = isToday ? `Today's tasks [${formattedDate}]\n` : `Date [${formattedDate}]\n`;
        }

        for (const projectId in tasksByProject) {
            const projectName = getProjectName(projectId);
            content += `    ${projectName}\n`;
            
            // Group tasks by parent/subtask relationship
            const projectTasks = tasksByProject[projectId];
            const parentTasks = projectTasks.filter(t => !t.parentTaskId);
            const subtasksMap = new Map<string, Task[]>();
            
            projectTasks.forEach(task => {
                if (task.parentTaskId) {
                    if (!subtasksMap.has(task.parentTaskId)) {
                        subtasksMap.set(task.parentTaskId, []);
                    }
                    subtasksMap.get(task.parentTaskId)!.push(task);
                }
            });

            // Sort parent tasks by priority
            const sortedParents = [...parentTasks].sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
            });

            sortedParents.forEach(parentTask => {
                if (format === 'withStatus') {
                    const status = parentTask.isCompleted ? 'DONE' : 'WIP';
                    content += `       - ${parentTask.title} - ${status}\n`;
                } else {
                    content += `       - ${parentTask.title}\n`;
                }

                // Add subtasks with extra indentation
                const subtasks = subtasksMap.get(parentTask.id) || [];
                const sortedSubtasks = [...subtasks].sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
                });

                sortedSubtasks.forEach(subtask => {
                    if (format === 'withStatus') {
                        const status = subtask.isCompleted ? 'DONE' : 'WIP';
                        content += `          - ${subtask.title} - ${status}\n`;
                    } else {
                        content += `          - ${subtask.title}\n`;
                    }
                });
            });
            
            content += `\n`;
        }

        return content.trim();
    };

    const handleFormatSelect = (format: CopyFormat) => {
        const content = generateContent(format);
        onCopy(content);
    };

    const formatOptions = [
        {
            value: 'normal' as CopyFormat,
            label: 'Without status',
            description: 'Copy tasks in the current format without completion status',
        },
        {
            value: 'withStatus' as CopyFormat,
            label: 'With status',
            description: 'Copy tasks with completion status (DONE or WIP)',
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
                <Label className="text-sm font-medium">Copy format</Label>
                {formatOptions.map((option) => (
                    <div
                        key={option.value}
                        className="border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted/70"
                        onClick={() => handleFormatSelect(option.value)}
                    >
                        <div>
                            <Label className="text-sm font-medium cursor-pointer block">
                                {option.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{option.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleCopyModal;

