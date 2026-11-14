import { Component, input, output, signal } from '@angular/core';
import { KanbanColumn, Task, TaskDropEvent, dueLabel, isOverdue, statusColor, textOn } from '../../models/task';

@Component({
  selector: 'app-tm-kanban-board',
  standalone: true,
  templateUrl: './tm-kanban-board.component.html',
  styleUrl: './tm-kanban-board.component.scss'
})
export class TmKanbanBoard {
  readonly columns = input.required<KanbanColumn[]>();
  readonly locked = input(false);

  readonly taskOpen = output<string>();
  readonly taskDropped = output<TaskDropEvent>();

  readonly draggedId = signal<string | null>(null);
  readonly dropStatusId = signal<string | null>(null);
  readonly dropIndex = signal<number | null>(null);
  private suppressClick = false;

  readonly dueLabel = dueLabel;
  readonly isOverdue = isOverdue;
  readonly statusColor = statusColor;
  readonly textOn = textOn;

  onDragStart(event: DragEvent, taskId: string): void {
    if (this.locked()) {
      event.preventDefault();
      return;
    }
    this.suppressClick = true;
    this.draggedId.set(taskId);
    event.dataTransfer?.setData('text/plain', taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(): void {
    this.draggedId.set(null);
    this.dropStatusId.set(null);
    this.dropIndex.set(null);
    setTimeout(() => {
      this.suppressClick = false;
    });
  }

  openTask(taskId: string): void {
    if (this.suppressClick) {
      return;
    }
    this.taskOpen.emit(taskId);
  }

  onColumnDragOver(event: DragEvent, statusId: string, tasks: Task[]): void {
    if (!this.draggedId() || this.locked()) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('.task-card')) {
      return;
    }
    this.dropStatusId.set(statusId);
    this.dropIndex.set(this.indexExcludingDragged(tasks, tasks.length));
  }

  onCardDragOver(event: DragEvent, statusId: string, tasks: Task[], index: number): void {
    if (!this.draggedId() || this.locked()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    const base = this.indexExcludingDragged(tasks, index);
    this.dropStatusId.set(statusId);
    this.dropIndex.set(after ? base + (tasks[index]?.id === this.draggedId() ? 0 : 1) : base);
  }

  onColumnDrop(event: DragEvent, statusId: string): void {
    if (this.locked()) {
      return;
    }
    event.preventDefault();
    this.emitDrop(statusId);
  }

  onCardDrop(event: DragEvent, statusId: string): void {
    if (this.locked()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.emitDrop(statusId);
  }

  isDropBefore(statusId: string, tasks: Task[], index: number): boolean {
    if (this.dropStatusId() !== statusId || this.dropIndex() === null) {
      return false;
    }
    return this.indexExcludingDragged(tasks, index) === this.dropIndex() && tasks[index]?.id !== this.draggedId();
  }

  private emitDrop(statusId: string): void {
    const taskId = this.draggedId();
    const index = this.dropIndex();
    this.onDragEnd();
    if (!taskId || index === null) {
      return;
    }
    this.taskDropped.emit({ taskId, statusId, index });
  }

  private indexExcludingDragged(tasks: Task[], index: number): number {
    const draggedId = this.draggedId();
    const before = tasks.slice(0, index).filter((task) => task.id !== draggedId).length;
    return before;
  }
}
