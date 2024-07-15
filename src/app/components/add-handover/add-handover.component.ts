import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { ScaffoldCost } from 'src/app/models/scaffold-cost';
import { HandoverService } from 'src/app/services/handover.service';

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
  changes = { scaffold: [], attachments: [], boards: [] };

  private handoverSvc = inject(HandoverService);

  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.customer$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${company.id}/customers`,
        this.scaffold.customerId
      ) as Observable<Customer>;
    this.handover.code = this.masterSvc
      .edit()
      .generateDocCode(company.totalHandovers, 'HAN');
    this.handover.scaffold = this.scaffold;

    this.template$ = this.masterSvc
      .edit()
      .getDocById(`company/${company.id}/templates`, 'handover')
      .pipe(
        tap((handover: HandoverTemplate) => {
          this.handover.detail = handover.detail;
        })
      ) as Observable<HandoverTemplate>;
  }
  updateList(ev: HandoverTemplate) {
    this.handover.questions = ev;
  }

  updateScaffold(ev) {
    this.changes = { scaffold: [], attachments: [], boards: [] };
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
    if (this.scaffold.latestHandover) {
      const oldScaffold = this.scaffold.latestHandover.scaffold;
      const newScaffold = this.scaffold;

      this.changes.scaffold.push(
        ...this.handoverSvc.checkChanges(
          oldScaffold.scaffold,
          newScaffold.scaffold
        )
      );
      if (newScaffold.attachments.length >= oldScaffold.attachments.length) {
        newScaffold.attachments.forEach((item, index) => {
          const attChanges = this.handoverSvc.checkChanges(
            oldScaffold.attachments[index]
              ? oldScaffold.attachments[index]
              : null,
            item
          );
          this.changes.attachments.push(...attChanges);
        });
      } else {
        oldScaffold.attachments.forEach((item, index) => {
          const attChanges = this.handoverSvc.checkChanges(
            item,
            newScaffold.attachments[index]
              ? newScaffold.attachments[index]
              : null
          );
          this.changes.attachments.push(...attChanges);
        });
      }

      if (newScaffold.boards.length >= oldScaffold.boards.length) {
        newScaffold.boards.forEach((item, index) => {
          const attChanges = this.handoverSvc.checkChanges(
            oldScaffold.boards[index] ? oldScaffold.boards[index] : null,
            item
          );
          this.changes.boards.push(...attChanges);
        });
      } else {
        oldScaffold.boards.forEach((item, index) => {
          const attChanges = this.handoverSvc.checkChanges(
            item,
            newScaffold.boards[index] ? newScaffold.boards[index] : null
          );
          this.changes.boards.push(...attChanges);
        });
      }
    }
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
        delete this.scaffold.latestHandover;
        delete this.scaffold.latestInspection;
        this.handover.scaffold = this.scaffold;
        this.handover.changes = this.changes;
        await this.upload();
        await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/handovers`, this.handover);
        await this.masterSvc.edit().updateDoc('company', company.id, {
          totalHandovers: increment(1),
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
