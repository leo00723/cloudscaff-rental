import { Component, OnInit, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FileUploadComponent } from 'src/app/components/file-upload/file-upload.component';
import { Company } from 'src/app/models/company.model';
import { Enquiry } from 'src/app/models/enquiry.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { AddEnquiryComponent } from './add-enquiry/add-enquiry.component';

@Component({
  selector: 'app-enquiries',
  templateUrl: './enquiries.page.html',
})
export class EnquiriesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  enquiries$: Observable<Enquiry[]>;

  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async addEnquiry() {
    const modal = await this.masterSvc.modal().create({
      component: AddEnquiryComponent,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEnquiry',
    });
    return await modal.present();
  }
  async editEnquiry(enquiry: Enquiry) {
    const modal = await this.masterSvc.modal().create({
      component: AddEnquiryComponent,
      componentProps: {
        value: enquiry,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editEnquiry',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.enquiries$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/enquiries`, 'code', 'desc');
      } else {
        this.masterSvc.log(
          '-----------------------try enquiries----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
