import React, { useState } from 'react';
import { Task } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

type CopyFormat = 'normal' | 'withStatus' | 'csv';

interface CopyTasksModalProps {
    tasks: Task[];
    date: string;
    onCopy: (content: string) => void;
    onCancel: () => void;
    defaultIncludeDate: boolean;
}

const CopyTasksModal: React.FC<CopyTasksModalProps> = ({ tasks, date, onCopy, onCancel, defaultIncludeDate }) => {
    const [selectedFormat, setSelectedFormat] = useState<CopyFormat>('normal');
    const [includeDate, setIncludeDate] = useState(defaultIncludeDate);

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
        let content = '';

        if (format === 'csv') {
            // CSV format - no date included, even if includeDate is enabled
            content = tasks.map(task => task.title).join(', ');
        } else {
            // Normal and withStatus formats
            // For non-today dates, always include date. For today, respect includeDate toggle
            const shouldIncludeDate = !isToday || includeDate;

            if (format === 'withStatus') {
                content = shouldIncludeDate ? `Updates [${formattedDate}]\n` : `Updates\n`;
            } else {
                if (shouldIncludeDate) {
                    content = isToday ? `Today's tasks [${formattedDate}]\n` : `Date [${formattedDate}]\n`;
                } else {
                    content = `Today's tasks\n`;
                }
            }

            // Group tasks by parent/subtask relationship
            const parentTasks = tasks.filter(t => !t.parentTaskId);
            const subtasksMap = new Map<string, Task[]>();
            
            tasks.forEach(task => {
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
                if (format === 'normal') {
                    content += `    - ${parentTask.title}\n`;
                } else if (format === 'withStatus') {
                    const status = parentTask.isCompleted ? 'DONE' : 'WIP';
                    content += `     - ${parentTask.title} - ${status}\n`;
                }

                // Add subtasks with extra indentation
                const subtasks = subtasksMap.get(parentTask.id) || [];
                const sortedSubtasks = [...subtasks].sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
                });

                sortedSubtasks.forEach(subtask => {
                    if (format === 'normal') {
                        content += `        - ${subtask.title}\n`;
                    } else if (format === 'withStatus') {
                        const status = subtask.isCompleted ? 'DONE' : 'WIP';
                        content += `         - ${subtask.title} - ${status}\n`;
                    }
                });
            });
        }

        return content.trim();
    };


    const handleFormatSelect = (format: CopyFormat) => {
        setSelectedFormat(format);
        const content = generateContent(format);
        onCopy(content);
    };

    const formatOptions = [
        {
            value: 'normal' as CopyFormat,
            label: 'Without status',
            description: 'Copy tasks in a simple list format without completion status',
        },
        {
            value: 'withStatus' as CopyFormat,
            label: 'With status',
            description: 'Include task completion status (DONE or WIP) with each task',
        },
        {
            value: 'csv' as CopyFormat,
            label: 'CSV (comma separated values)',
            description: 'Copy tasks as comma-separated values, suitable for spreadsheets or zoho timesheet',
        },
    ];

    const isToday = date === getTodayDateString();
    const showIncludeDateOption = isToday && selectedFormat !== 'csv';

    return (
        <div className="space-y-4 sm:space-y-6">
            {showIncludeDateOption && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pb-4 border-b border-border">
                    <div className="flex-1">
                        <Label className="text-sm font-medium">Include date</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Include the date header in the copied text
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Switch
                            checked={includeDate}
                            onCheckedChange={setIncludeDate}
                        />
                    </div>
                </div>
            )}

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

export default CopyTasksModal;

