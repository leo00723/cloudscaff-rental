import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Handover } from 'src/app/models/handover.model';
import { HandoverTemplate } from 'src/app/models/handoverTemplate.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';

@Component({
  selector: 'app-add-handover',
  templateUrl: './add-handover.component.html',
})
export class AddHandoverComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() set value(val: Scaffold) {
    Object.assign(this.scaffold, val);
  }
  scaffold: Scaffold = {};
  @Select() company$: Observable<Company>;
  customer$: Observable<Customer>;
  template$: Observable<HandoverTemplate>;
  handover: Handover = {
    safe: '',
    type: '',
    maxLoad: '',
    status: 'pending-Needs Signature',
    date: new Date(),
    erectPercentage: 0,
    dismantlePercentage: 0,
    uploads: [],
  };

  loading = false;
  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company).id;
    this.customer$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${id}/customers`,
        this.scaffold.customerId
      ) as Observable<Customer>;
    this.handover.code = `HAN${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.scaffold.totalHandovers ? this.scaffold.totalHandovers + 1 : 1)
      .toString()
      .padStart(6, '0')}`;
    this.handover.scaffold = this.scaffold;

    this.template$ = this.masterSvc
      .edit()
      .getDocById(`company/${id}/templates`, 'handover')
      .pipe(
        tap((handover: HandoverTemplate) => {
          this.handover.detail = handover.detail;
        })
      ) as Observable<HandoverTemplate>;
  }

  updateScaffold(ev) {
    this.scaffold.scaffold = ev.scaffold;
    this.scaffold.boards = ev.boards;
    this.scaffold.attachments = ev.attachments;
    this.scaffold.totalArea = 0;
    this.scaffold.totalPlatforms = 0;
    this.scaffold.boards.forEach((b) => {
      const area = +b.length * +b.width * +b.qty;
      this.scaffold.totalArea += area;
      this.scaffold.totalPlatforms += +b.qty;
    });
  }
  create(customer: Customer) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.handover.createdBy = user.id;
        this.handover.createdByName = user.name;
        this.handover.company = company;
        this.handover.customer = customer;
        this.handover.scaffold = this.scaffold;
        await this.upload();
        await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/handovers`, this.handover);
        await this.masterSvc
          .edit()
          .updateDoc(`company/${company.id}/scaffolds`, this.scaffold.id, {
            totalHandovers: increment(1),
            latestHandover: { ...this.handover },
          });
        this.masterSvc
          .notification()
          .toast('Handover created successfully', 'success');
        this.loading = false;
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your Handover, Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'addHandover');
  }
  pinFormatter(value: number) {
    return `${value}%`;
  }
  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.handover.uploads.push(...newFiles);
  }
}
