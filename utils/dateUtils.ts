
import { ReportPeriod } from '../types';

export const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDateString = (): string => {
    return getFormattedDate(new Date());
}

export const getHumanReadableDate = (dateString: string): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = getFormattedDate(today);
  const yesterdayStr = getFormattedDate(yesterday);
  const tomorrowStr = getFormattedDate(tomorrow);

  if (dateString === todayStr) return 'Today';
  if (dateString === yesterdayStr) return 'Yesterday';
  if (dateString === tomorrowStr) return 'Tomorrow';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const getDateRange = (period: ReportPeriod): { start: Date, end: Date } => {
    const end = new Date();
    const start = new Date();

    switch (period) {
        case 'day':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            break;
        case 'month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'year':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
    }
    return { start, end };
}
