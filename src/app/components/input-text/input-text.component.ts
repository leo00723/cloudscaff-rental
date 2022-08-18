import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent implements OnInit {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() reorder = false;
  @Input() readonly = false;
  @Input() optional = false;
  @Input() textarea = false;
  @Input() margin = 'mb-3';
  @Output() fieldChange = new EventEmitter<any>();
  value1: number | string;
  form: FormGroup;
  constructor(private fb: FormBuilder) {}

  @Input() set value(val: number | string) {
    this.value1 = val;
    if (this.form && val) {
      this.form.get('field').setValue(val);
    }
  }

  ngOnInit(): void {
    if (this.type === 'number') {
      this.form = this.fb.group({
        field: [
          this.value1,
          [
            !this.optional ? Validators.required : Validators.nullValidator,
            Validators.min(0),
          ],
        ],
      });
    } else {
      this.form = this.fb.group({
        field: [
          this.value1,
          !this.optional ? Validators.required : Validators.nullValidator,
        ],
      });
    }
  }

  update(args) {
    if (this.type === 'number') {
      this.fieldChange.emit(this.form.valid ? +args.detail.value : 0);
    } else {
      this.fieldChange.emit(this.form.valid ? args.detail.value : '');
    }
  }
}
