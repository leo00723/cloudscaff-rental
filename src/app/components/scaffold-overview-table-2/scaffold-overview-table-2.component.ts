import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Scaffold } from 'src/app/models/scaffold.model';

@Component({
  selector: 'app-scaffold-overview-table-2',
  templateUrl: './scaffold-overview-table-2.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldOverviewTable2Component implements OnInit {
  @Input() scaffold: Scaffold;
  @Input() detailed = true;
  @Input() showSafe = false;
  @Input() simplified = false;
  @Select() company$: Observable<Company>;
  constructor() {}

  ngOnInit(): void {}
}
