export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatShortDate(timestamp);
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function yesterdayDateString(): string {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function groupSessionsByDay<T extends { startedAt: number }>(
  sessions: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const session of sessions) {
    const key = new Date(session.startedAt).toISOString().split('T')[0];
    const group = map.get(key) ?? [];
    group.push(session);
    map.set(key, group);
  }
  return map;
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getSessionsThisWeek<T extends { startedAt: number }>(sessions: T[]): T[] {
  const weekStart = getWeekStart().getTime();
  return sessions.filter((s) => s.startedAt >= weekStart);
}
