import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tile',
  standalone: true,
  templateUrl: './app-tile.component.html',
  styleUrl: './app-tile.component.scss',
  host: {
    '[class.compact]': 'compact()'
  }
})
export class AppTile {
  readonly label = input.required<string>();
  readonly compact = input(false);
}
