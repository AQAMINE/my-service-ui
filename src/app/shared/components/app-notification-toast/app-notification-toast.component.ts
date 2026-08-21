import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  templateUrl: './app-notification-toast.component.html',
  styleUrl: './app-notification-toast.component.scss'
})
export class AppNotificationToast {
  private readonly notificationService = inject(NotificationService);

  readonly notification = this.notificationService.notification;

  dismiss(): void {
    this.notificationService.dismiss();
  }
}
