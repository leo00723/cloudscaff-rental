import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-input-select-reactive',
  templateUrl: './input-select-reactive.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectReactiveComponent {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() selectedText: string;
  @Input() type = 'text';
  @Input() controlName: string;
  @Input() form;
  @Output() fieldChange = new EventEmitter<any>();

  update(args) {
    if (this.type === 'number') {
      this.fieldChange.emit(+args.detail.value);
    } else {
      this.fieldChange.emit(args.detail.value);
    }
  }
}
