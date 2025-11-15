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
            tasksByProject[projectId].forEach(task => {
                if (format === 'withStatus') {
                    const status = task.isCompleted ? 'DONE' : 'WIP';
                    content += `       - ${task.title} - ${status}\n`;
                } else {
                    content += `       - ${task.title}\n`;
                }
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

