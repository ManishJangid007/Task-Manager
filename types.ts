
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
}

export type View = 'daily' | 'reports' | 'settings' | { type: 'project'; id: string };

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';
