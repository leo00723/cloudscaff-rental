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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() value: number;
  @Input() readonly = false;
  @Input() optional = false;
  @Output() fieldChange = new EventEmitter<any>();

  update(args) {
    this.fieldChange.emit(args.detail.value);
  }
}
