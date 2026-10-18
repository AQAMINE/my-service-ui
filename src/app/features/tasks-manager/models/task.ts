export interface TaskStatus {
  id: string;
  code: string;
  label: string;
  color: string | null;
  position: number;
  isSystem: boolean;
}

export interface TaskPriority {
  id: string;
  code: string;
  label: string;
  color: string | null;
  level: number;
  isSystem: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskViewMode = 'kanban' | 'list';
export type TaskSortField = 'dueDate' | 'createdAt' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  statusId: string;
  priorityId: string;
  position?: number | null;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  statusId?: string;
  priorityId?: string;
  position?: number;
  dueDate?: string | null;
  updateDueDate?: boolean;
}

export interface CreateTaskStatusPayload {
  code: string;
  label: string;
  color?: string | null;
  position?: number | null;
}

export interface CreateTaskPriorityPayload {
  code: string;
  label: string;
  color?: string | null;
  level?: number | null;
}

export interface TaskDropEvent {
  taskId: string;
  statusId: string;
  index: number;
}

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface StatusCount {
  id: string;
  label: string;
  color: string;
  count: number;
}

const FALLBACK_COLOR = '#6C757D';

export function statusColor(color: string | null | undefined): string {
  return color && color.trim() ? color : FALLBACK_COLOR;
}

export function textOn(color: string | null | undefined): string {
  const hex = statusColor(color).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return '#ffffff';
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#0f172a' : '#ffffff';
}

export function isOverdue(task: Task, now = Date.now()): boolean {
  if (!task.dueDate || task.status.code === 'DONE') {
    return false;
  }
  return new Date(task.dueDate).getTime() < now;
}

export function dueLabel(iso: string | null): string {
  if (!iso) {
    return 'Sans échéance';
  }
  const date = new Date(iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - start.getTime()) / 86_400_000);
  if (diff === 0) {
    return "Aujourd'hui";
  }
  if (diff === 1) {
    return 'Demain';
  }
  if (diff === -1) {
    return 'Hier';
  }
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

export function toDatetimeLocal(iso: string | null): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocal(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}
