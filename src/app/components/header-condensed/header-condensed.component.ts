import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-header-condensed',
  templateUrl: './header-condensed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCondensedComponent implements OnInit {
  @Input() title = '';

  constructor() {}

  ngOnInit() {}
}
