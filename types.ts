
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  priority?: TaskPriority;
}

export interface Project {
  id: string;
  name: string;
  pinned?: boolean;
}

export type View = 'daily' | 'reports' | 'settings' | { type: 'project'; id: string } | { type: 'configuration'; projectId: string };

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export type ProjectSortOrder = 'alphabetical' | 'taskCount' | 'recentActivity';

export interface Configuration {
  id: string;
  projectId: string;
  key: string;
  value: string;
}
