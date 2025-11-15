
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, Task, ReportPeriod } from '../types';
import { getDateRange } from '../utils/dateUtils';
import { Select } from './ui/select';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ tasks, projects }) => {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const reportData = useMemo(() => {
    const { start, end } = getDateRange(period);
    
    const completedTasksInPeriod = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return task.isCompleted && taskDate >= start && taskDate <= end;
    });

    const projectCounts = projects.map(project => {
        const count = completedTasksInPeriod.filter(task => task.projectId === project.id).length;
        return { name: project.name, tasks: count };
    });

    return projectCounts.filter(p => p.tasks > 0).sort((a,b) => b.tasks - a.tasks);
  }, [tasks, projects, period]);

  const periodOptions = [
    { value: 'day', label: 'This Day' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Reports</h2>
        <Select
          value={period}
          onChange={(value) => setPeriod(value as ReportPeriod)}
          options={periodOptions}
          placeholder="Select period"
          className="w-[180px]"
        />
      </div>

      <div className="bg-card p-4 rounded-lg shadow h-96 border border-border">
        {reportData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                    backgroundColor: isDarkMode 
                      ? 'rgba(31, 41, 55, 0.95)' 
                      : 'rgba(255, 255, 255, 0.98)',
                    borderColor: isDarkMode 
                      ? 'rgba(128, 128, 128, 0.5)' 
                      : 'rgba(128, 128, 128, 0.3)',
                    color: isDarkMode 
                      ? '#ffffff' 
                      : '#1f2937',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" name="Completed Tasks" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No completed tasks in this period to display.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
