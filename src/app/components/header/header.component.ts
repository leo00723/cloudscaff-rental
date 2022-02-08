import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() title = '';
  @Input() showMenu = true;
  @Input() path = '';
  @Input() btnName: string;
  @Output() updated = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}
  update() {
    this.updated.emit(true);
  }
}
