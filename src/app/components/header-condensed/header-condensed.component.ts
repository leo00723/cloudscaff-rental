import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-condensed',
  templateUrl: './header-condensed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCondensedComponent {
  @Input() title = '';
}
