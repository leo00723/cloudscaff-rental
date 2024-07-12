import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Enquiry } from 'src/app/models/enquiry.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { AddEnquiryComponent } from '../enquiries/add-enquiry/add-enquiry.component';
import { AddInstructionComponent } from 'src/app/components/add-instruction/add-instruction.component';
import { SI } from 'src/app/models/si.model';

@Component({
  selector: 'app-site-instructions',
  templateUrl: './site-instructions.page.html',
})
export class SiteInstructionsPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  siteInstructions$: Observable<any[]>;

  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async addSI() {
    this.masterSvc.router().navigateByUrl('/dashboard/sites');
  }
  async viewInstruction(instruction: SI) {
    const modal = await this.masterSvc.modal().create({
      component: AddInstructionComponent,
      componentProps: {
        isEdit: true,
        value: instruction,
        site: instruction.site,
      },
      showBackdrop: false,
      id: 'viewInstruction',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=1&vid=0');
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.siteInstructions$ = this.masterSvc
          .edit()
          .getCollectionOrdered(
            `company/${id}/siteInstructions`,
            'code',
            'desc'
          );
      } else {
        this.masterSvc.log(
          '-----------------------try si----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
