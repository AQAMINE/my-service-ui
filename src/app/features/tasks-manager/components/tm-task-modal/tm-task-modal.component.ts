import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskPriority, TaskStatus, fromDatetimeLocal, toDatetimeLocal } from '../../models/task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tm-task-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tm-task-modal.component.html',
  styleUrl: './tm-task-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class TmTaskModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskService = inject(TaskService);
  private formReady = false;

  readonly open = input(false);
  readonly mode = input<'create' | 'edit'>('create');
  readonly task = input<Task | null>(null);
  readonly statuses = input.required<TaskStatus[]>();
  readonly priorities = input.required<TaskPriority[]>();
  readonly tasks = input<Task[]>([]);

  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly title = signal('');
  readonly description = signal('');
  readonly statusId = signal('');
  readonly priorityId = signal('');
  readonly dueDate = signal('');
  readonly submitting = signal(false);
  readonly confirmingDelete = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const open = this.open();
      if (!open) {
        this.formReady = false;
        this.confirmingDelete.set(false);
        this.errorMessage.set(null);
        return;
      }
      const canFill = this.mode() === 'edit'
        ? !!this.task()
        : this.statuses().length > 0 && this.priorities().length > 0;
      if (!this.formReady && canFill) {
        this.fillForm();
        this.formReady = true;
      }
    });

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

  submit(): void {
    const title = this.title().trim();
    if (!title || !this.statusId() || !this.priorityId()) {
      this.errorMessage.set('Le titre, le statut et la priorité sont obligatoires.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const dueDate = fromDatetimeLocal(this.dueDate());
    const description = this.description().trim();

    const request =
      this.mode() === 'edit' && this.task()
        ? this.taskService.updateTask(this.task()!.id, {
            title,
            description,
            statusId: this.statusId(),
            priorityId: this.priorityId(),
            position: this.positionFor(this.statusId()),
            dueDate,
            updateDueDate: true
          })
        : this.taskService.createTask({
            title,
            description: description || null,
            statusId: this.statusId(),
            priorityId: this.priorityId(),
            position: this.positionFor(this.statusId()),
            dueDate
          });

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.readError(error, "Impossible d'enregistrer la tâche."));
      }
    });
  }

  deleteTask(): void {
    const task = this.task();
    if (!task) {
      return;
    }
    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Impossible de supprimer la tâche.');
      }
    });
  }

  private fillForm(): void {
    const task = this.task();
    this.confirmingDelete.set(false);
    this.errorMessage.set(null);
    if (this.mode() === 'edit' && task) {
      this.title.set(task.title);
      this.description.set(task.description ?? '');
      this.statusId.set(task.status.id);
      this.priorityId.set(task.priority.id);
      this.dueDate.set(toDatetimeLocal(task.dueDate));
      return;
    }

    const priorities = this.priorities();
    const medium = priorities.find((priority) => priority.code === 'MEDIUM');
    this.title.set('');
    this.description.set('');
    this.statusId.set(this.statuses()[0]?.id ?? '');
    this.priorityId.set(medium?.id ?? priorities[0]?.id ?? '');
    this.dueDate.set('');
  }

  private positionFor(statusId: string): number {
    const task = this.task();
    if (task && task.status.id === statusId) {
      return task.position;
    }
    const positions = this.tasks()
      .filter((item) => item.status.id === statusId && item.id !== task?.id)
      .map((item) => item.position);
    if (positions.length === 0) {
      return 0;
    }
    return Math.max(...positions) + 1;
  }

  private readError(error: HttpErrorResponse, fallback: string): string {
    const message = error.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
