import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { MasterService } from 'src/app/services/master.service';
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
  @Input() value = '';
  @Input() isCurrency = true;
  @Input() skeleton = true;
  company: Company;
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.skeleton = false;
        this.change.detectChanges();
      } else {
        this.masterSvc.log(
          '-----------------------try card----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
