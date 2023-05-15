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
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
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

  // async update(enquiries: Enquiry[]) {
  //   let counter = 0;
  //   for await (const enq of enquiries) {
  //     if (!enq.recievedDate.startsWith('2022') && enq.recievedDate) {
  //       const rd = enq.recievedDate.split('-');
  //       const nrd = `${rd[2]}-${rd[1]}-${rd[0]}`;
  //       enq.recievedDate = nrd;
  //       const retd = enq.returnDate.split('-');
  //       const nretd = `${retd[2]}-${retd[1]}-${retd[0]}`;
  //       enq.returnDate = nretd;
  //       await this.masterSvc
  //         .edit()
  //         .updateDoc(`company/${enq.company.id}/enquiries`, enq.id, {
  //           recievedDate: enq.recievedDate,
  //           returnDate: enq.returnDate,
  //         });
  //     }
  //   }
  //   console.log('update done');
  // }
}
