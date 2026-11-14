import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNotificationToast } from './shared/components/app-notification-toast/app-notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-service-ui');
}
