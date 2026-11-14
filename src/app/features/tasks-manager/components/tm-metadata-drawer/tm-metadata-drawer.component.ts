import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TaskPriority, TaskStatus, statusColor } from '../../models/task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tm-metadata-drawer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tm-metadata-drawer.component.html',
  styleUrl: './tm-metadata-drawer.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class TmMetadataDrawer {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskService = inject(TaskService);

  readonly open = input(false);
  readonly statuses = input.required<TaskStatus[]>();
  readonly priorities = input.required<TaskPriority[]>();

  readonly closed = output<void>();
  readonly changed = output<void>();

  readonly statusCode = signal('');
  readonly statusLabel = signal('');
  readonly statusColorValue = signal('#6C757D');
  readonly statusPosition = signal<number | null>(null);
  readonly priorityCode = signal('');
  readonly priorityLabel = signal('');
  readonly priorityColorValue = signal('#6C757D');
  readonly priorityLevel = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly confirmId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly colorOf = statusColor;

  constructor() {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.open() && !this.submitting()) {
        this.close();
      }
    };
    this.document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', onKeydown));
  }

  close(): void {
    if (this.submitting()) {
      return;
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  createStatus(): void {
    const code = this.statusCode().trim();
    const label = this.statusLabel().trim();
    if (!code || !label) {
      this.errorMessage.set('Le code et le libellé du statut sont obligatoires.');
      return;
    }
    const position = this.statusPosition() ?? this.nextStatusPosition();
    this.run(
      this.taskService.createStatus({
        code,
        label,
        color: this.statusColorValue(),
        position
      }),
      () => {
        this.statusCode.set('');
        this.statusLabel.set('');
        this.statusColorValue.set('#6C757D');
        this.statusPosition.set(null);
      }
    );
  }

  createPriority(): void {
    const code = this.priorityCode().trim();
    const label = this.priorityLabel().trim();
    if (!code || !label) {
      this.errorMessage.set('Le code et le libellé de la priorité sont obligatoires.');
      return;
    }
    const level = this.priorityLevel() ?? this.nextPriorityLevel();
    this.run(
      this.taskService.createPriority({
        code,
        label,
        color: this.priorityColorValue(),
        level
      }),
      () => {
        this.priorityCode.set('');
        this.priorityLabel.set('');
        this.priorityColorValue.set('#6C757D');
        this.priorityLevel.set(null);
      }
    );
  }

  askDelete(id: string, isSystem: boolean): void {
    if (isSystem || this.submitting()) {
      return;
    }
    this.confirmId.set(this.confirmId() === id ? null : id);
  }

  deleteStatus(id: string): void {
    this.run(this.taskService.deleteStatus(id), () => this.confirmId.set(null));
  }

  deletePriority(id: string): void {
    this.run(this.taskService.deletePriority(id), () => this.confirmId.set(null));
  }

  private nextStatusPosition(): number {
    return this.statuses().reduce((max, status) => Math.max(max, status.position), 0) + 1;
  }

  private nextPriorityLevel(): number {
    return this.priorities().reduce((max, priority) => Math.max(max, priority.level), 0) + 1;
  }

  private run(request: Observable<unknown>, done: () => void): void {
    this.submitting.set(true);
    this.errorMessage.set(null);
    request.subscribe({
      next: () => {
        this.submitting.set(false);
        done();
        this.changed.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.readError(error));
      }
    });
  }

  private readError(error: HttpErrorResponse): string {
    if (error.status === 409 || error.status === 500) {
      return 'Action impossible. Un élément système, ou encore utilisé par une tâche, ne peut pas être supprimé.';
    }
    const message = error.error?.message;
    return typeof message === 'string' && message.trim() ? message : 'Action impossible. Réessayez.';
  }
}
