import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent implements OnInit {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() controlName: string;
  @Input() readonly = false;
  @Input() form;
  @Output() fieldChange = new EventEmitter<boolean>();
  constructor() {}

  ngOnInit() {}

  update() {
    this.fieldChange.emit(true);
  }
}
