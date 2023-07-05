import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  templateUrl: './page-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [],
})
export class PagePlaceholderComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Output() clicked = new EventEmitter<boolean>();
}
