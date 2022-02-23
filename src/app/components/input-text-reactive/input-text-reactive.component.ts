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
  @Input() controlName: string;
  @Input() readonly = false;
  @Input() optional = false;
  @Input() form;
  @Output() fieldChange = new EventEmitter<any>();

  update(args) {
    if (this.type === 'number') {
      this.fieldChange.emit(+args.detail.value);
    } else {
      this.fieldChange.emit(args.detail.value);
    }
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && field.touched;
  }
}
