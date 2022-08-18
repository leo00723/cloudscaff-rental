import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-reactive',
  templateUrl: './input-text-reactive.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextReactiveComponent {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() margin = 'mb-3';
  @Input() reorder = false;
  @Input() controlName: string;
  @Input() readonly = false;
  @Input() optional = false;
  @Input() textarea = false;
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
