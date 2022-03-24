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
  selector: 'app-scaffold-overview-table',
  templateUrl: './scaffold-overview-table.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldOverviewTableComponent implements OnInit {
  @Input() scaffold: Scaffold;
  @Input() detailed = true;
  @Select() company$: Observable<Company>;
  constructor() {}

  ngOnInit(): void {}
}
