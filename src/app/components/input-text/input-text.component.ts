import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() value: string;
  @Input() readonly = false;
  @Input() optional = false;
  @Output() fieldChange = new EventEmitter<boolean>();

  update() {
    this.fieldChange.emit(true);
  }
}
