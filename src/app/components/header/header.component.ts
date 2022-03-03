import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() title = '';
  @Input() showMenu = true;
  @Input() path = '';
  @Input() btnName: string;
  @Output() updated = new EventEmitter<boolean>();

  update() {
    this.updated.emit(true);
  }
}
