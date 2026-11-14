import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTaskPayload,
  CreateTaskPriorityPayload,
  CreateTaskStatusPayload,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload
} from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = `${environment.tasksApiUrl}/v1/tasks`;
  private readonly statusesUrl = `${environment.tasksApiUrl}/v1/task-statuses`;
  private readonly prioritiesUrl = `${environment.tasksApiUrl}/v1/task-priorities`;

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksUrl);
  }

  createTask(body: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, body);
  }

  updateTask(id: string, body: UpdateTaskPayload): Observable<Task> {
    return this.http.patch<Task>(`${this.tasksUrl}/${id}`, body);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`);
  }

  getStatuses(): Observable<TaskStatus[]> {
    return this.http.get<TaskStatus[]>(this.statusesUrl);
  }

  createStatus(body: CreateTaskStatusPayload): Observable<TaskStatus> {
    return this.http.post<TaskStatus>(this.statusesUrl, body);
  }

  deleteStatus(id: string): Observable<void> {
    return this.http.delete<void>(`${this.statusesUrl}/${id}`);
  }

  getPriorities(): Observable<TaskPriority[]> {
    return this.http.get<TaskPriority[]>(this.prioritiesUrl);
  }

  createPriority(body: CreateTaskPriorityPayload): Observable<TaskPriority> {
    return this.http.post<TaskPriority>(this.prioritiesUrl, body);
  }

  deletePriority(id: string): Observable<void> {
    return this.http.delete<void>(`${this.prioritiesUrl}/${id}`);
  }
}
