import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-dashboard-card-mini',
  templateUrl: './dashboard-card-mini.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardMiniComponent implements OnInit {
  @Input() color: 'primary' | 'success' | 'warning' | 'danger';
  @Input() icon = '';
  @Input() title = '';
  @Input() total = '';
  company: Company;
  constructor(private store: Store) {
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {}
}
