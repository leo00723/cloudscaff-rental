import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent implements OnInit {
  @Input() title: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() controlName: string;
  @Input() form: FormGroup;
  constructor() {}

  ngOnInit() {}
}
