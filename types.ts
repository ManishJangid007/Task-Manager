
export interface Task {
  id: string;
  projectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
}

export interface Project {
  id: string;
  name: string;
  pinned?: boolean;
}

export type View = 'daily' | 'reports' | 'settings' | { type: 'project'; id: string };

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export type ProjectSortOrder = 'alphabetical' | 'taskCount' | 'recentActivity';
