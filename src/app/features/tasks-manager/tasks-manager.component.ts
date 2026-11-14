import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TmFiltersBar } from './components/tm-filters-bar/tm-filters-bar.component';
import { TmKanbanBoard } from './components/tm-kanban-board/tm-kanban-board.component';
import { TmListPanel } from './components/tm-list-panel/tm-list-panel.component';
import { TmMetadataDrawer } from './components/tm-metadata-drawer/tm-metadata-drawer.component';
import { TmStatsPanel } from './components/tm-stats-panel/tm-stats-panel.component';
import { TmTaskModal } from './components/tm-task-modal/tm-task-modal.component';
import {
  KanbanColumn,
  SortDirection,
  StatusCount,
  Task,
  TaskDropEvent,
  TaskPriority,
  TaskSortField,
  TaskStatus,
  TaskViewMode,
  isOverdue,
  statusColor
} from './models/task';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-tasks-manager',
  standalone: true,
  imports: [TmStatsPanel, TmFiltersBar, TmKanbanBoard, TmListPanel, TmTaskModal, TmMetadataDrawer],
  templateUrl: './tasks-manager.component.html',
  styleUrl: './tasks-manager.component.scss'
})
export class TasksManager {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isLoading = signal(true);
  readonly moving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly statuses = signal<TaskStatus[]>([]);
  readonly priorities = signal<TaskPriority[]>([]);

  readonly search = signal('');
  readonly statusId = signal('');
  readonly priorityId = signal('');
  readonly sortField = signal<TaskSortField>('dueDate');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<TaskViewMode>('kanban');

  readonly isModalOpen = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly editingId = signal<string | null>(null);
  readonly isMetadataOpen = signal(false);

  readonly editingTask = computed(() => this.tasks().find((task) => task.id === this.editingId()) ?? null);

  readonly statusCounts = computed<StatusCount[]>(() =>
    this.statuses().map((status) => ({
      id: status.id,
      label: status.label,
      color: statusColor(status.color),
      count: this.tasks().filter((task) => task.status.id === status.id).length
    }))
  );

  readonly overdueCount = computed(() => this.tasks().filter((task) => isOverdue(task)).length);

  readonly filteredTasks = computed(() => {
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    const field = this.sortField();
    return [...this.matchingTasks()].sort((left, right) => {
      if (field === 'priority') {
        return (left.priority.level - right.priority.level) * direction;
      }
      const leftValue = field === 'dueDate' ? left.dueDate : left.createdAt;
      const rightValue = field === 'dueDate' ? right.dueDate : right.createdAt;
      if (!leftValue && !rightValue) {
        return 0;
      }
      if (!leftValue) {
        return 1;
      }
      if (!rightValue) {
        return -1;
      }
      return (new Date(leftValue).getTime() - new Date(rightValue).getTime()) * direction;
    });
  });

  readonly columns = computed<KanbanColumn[]>(() => {
    const statusId = this.statusId();
    const tasks = this.matchingTasks();
    return this.statuses()
      .filter((status) => !statusId || status.id === statusId)
      .map((status) => ({
        status,
        tasks: tasks
          .filter((task) => task.status.id === status.id)
          .sort((left, right) => left.position - right.position || left.createdAt.localeCompare(right.createdAt))
      }));
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.load();
  }

  load(): void {
    this.fetch(true);
  }

  private fetch(showLoading: boolean): void {
    if (showLoading) {
      this.isLoading.set(true);
    }
    this.errorMessage.set(null);
    forkJoin({
      tasks: this.taskService.getTasks(),
      statuses: this.taskService.getStatuses(),
      priorities: this.taskService.getPriorities()
    }).subscribe({
      next: ({ tasks, statuses, priorities }) => {
        this.tasks.set(tasks);
        this.statuses.set(statuses);
        this.priorities.set(priorities);
        this.isLoading.set(false);
      },
      error: () => {
        if (showLoading) {
          this.tasks.set([]);
          this.statuses.set([]);
          this.priorities.set([]);
        }
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les tâches. Réessayez plus tard.');
      }
    });
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.isModalOpen.set(true);
  }

  openTask(id: string): void {
    this.modalMode.set('edit');
    this.editingId.set(id);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingId.set(null);
  }

  onTaskSaved(): void {
    this.closeModal();
    this.fetch(false);
  }

  onMetadataChanged(): void {
    this.fetch(false);
  }

  onTaskDropped(event: TaskDropEvent): void {
    if (this.moving()) {
      return;
    }
    const task = this.tasks().find((item) => item.id === event.taskId);
    const status = this.statuses().find((item) => item.id === event.statusId);
    if (!task || !status) {
      return;
    }

    const siblings = this.tasks()
      .filter((item) => item.status.id === status.id && item.id !== task.id)
      .sort((left, right) => left.position - right.position || left.createdAt.localeCompare(right.createdAt));
    const currentIndex = this.tasks()
      .filter((item) => item.status.id === task.status.id)
      .sort((left, right) => left.position - right.position || left.createdAt.localeCompare(right.createdAt))
      .findIndex((item) => item.id === task.id);
    const index = Math.min(Math.max(event.index, 0), siblings.length);
    if (task.status.id === status.id && currentIndex === index) {
      return;
    }

    const next = [...siblings];
    next.splice(index, 0, task);
    const patches = next
      .map((item, position) => ({ item, position }))
      .filter(({ item, position }) => item.id === task.id || item.position !== position);

    this.tasks.update((items) =>
      items.map((item) => {
        const position = next.findIndex((candidate) => candidate.id === item.id);
        if (position < 0) {
          return item;
        }
        if (item.id === task.id) {
          return { ...item, status, position };
        }
        return item.position === position ? item : { ...item, position };
      })
    );

    this.moving.set(true);
    forkJoin(
      patches.map(({ item, position }) =>
        this.taskService.updateTask(item.id, {
          position,
          ...(item.id === task.id ? { statusId: status.id } : {})
        })
      )
    ).subscribe({
      next: (saved) => {
        const byId = new Map(saved.map((item) => [item.id, item]));
        this.tasks.update((items) => items.map((item) => byId.get(item.id) ?? item));
        this.moving.set(false);
      },
      error: () => {
        this.moving.set(false);
        this.errorMessage.set('Impossible de déplacer la tâche.');
        this.load();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private matchingTasks(): Task[] {
    const query = this.search().trim().toLowerCase();
    const statusId = this.statusId();
    const priorityId = this.priorityId();
    return this.tasks().filter((task) => {
      if (statusId && task.status.id !== statusId) {
        return false;
      }
      if (priorityId && task.priority.id !== priorityId) {
        return false;
      }
      if (!query) {
        return true;
      }
      return `${task.title} ${task.description ?? ''}`.toLowerCase().includes(query);
    });
  }
}
