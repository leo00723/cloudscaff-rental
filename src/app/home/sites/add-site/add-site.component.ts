import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styles: [],
})
export class AddSiteComponent {
  @Input() siteData: Site;
  @Input() isEdit = false;
  @Input() isCreate = false;
  @Input() isDelete = false;
  company: Company;
  user: User;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  close() {
    this.masterSvc.modal().dismiss();
  }
}
