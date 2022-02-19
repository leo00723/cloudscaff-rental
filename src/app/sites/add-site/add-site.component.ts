import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styles: [],
})
export class AddSiteComponent {
  @Input() siteData: Site;
  @Input() company: Company;
  @Input() user: any;
  @Input() isEdit = false;
  @Input() isCreate = false;
  @Input() isDelete = false;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
