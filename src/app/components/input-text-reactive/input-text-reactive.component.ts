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
  @Input() color: string;
  @Input() type = 'text';
  @Input() controlName: string;
  @Input() readonly = false;
  @Input() optional = false;
  @Input() form;
  @Output() fieldChange = new EventEmitter<boolean>();

  update(args) {
    // console.log(args.detail.value);
    this.fieldChange.emit(true);
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && field.touched;
  }
}
