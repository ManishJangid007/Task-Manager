
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, Task, ReportPeriod } from '../types';
import { getDateRange } from '../utils/dateUtils';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ tasks, projects }) => {
  const [period, setPeriod] = useState<ReportPeriod>('week');

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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h2>

      <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
        {(['day', 'week', 'month', 'year'] as ReportPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${period === p ? 'bg-white text-indigo-700 shadow dark:bg-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            This {p}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-96">
        {reportData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    borderColor: 'rgba(128, 128, 128, 0.5)',
                    color: '#ffffff',
                }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="#4f46e5" name="Completed Tasks" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No completed tasks in this period to display.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
