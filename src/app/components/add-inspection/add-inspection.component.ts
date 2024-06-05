import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Inspection } from 'src/app/models/inspection.model';
import { InspectionTemplate } from 'src/app/models/invoiceTemplate.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { ImgService } from 'src/app/services/img.service';

@Component({
  selector: 'app-add-inspection',
  templateUrl: './add-inspection.component.html',
})
export class AddInspectionComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input()
  set value(val: Scaffold) {
    Object.assign(this.scaffold, val);
  }
  scaffold: Scaffold = {};
  @Select() company$: Observable<Company>;
  questions$: Observable<InspectionTemplate>;
  customer$: Observable<Customer>;
  inspection: Inspection = {
    date: new Date(),
    status: '',
    notes: '',
    uploads: [],
  };
  loading = false;
  blob: any;
  private imgService = inject(ImgService);

  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.customer$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${company.id}/customers`,
        this.scaffold.customerId
      ) as Observable<Customer>;
    this.inspection.code = this.masterSvc
      .edit()
      .generateDocCode(company.totalInspections, 'INS');
    this.inspection.scaffold = this.scaffold;

    this.questions$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${company.id}/templates`,
        'inspection'
      ) as Observable<InspectionTemplate>;
  }

  updateList(ev: InspectionTemplate) {
    this.inspection.questions = ev;
  }
  updateScaffold(ev) {
    this.scaffold.scaffold = ev.scaffold;
    this.scaffold.boards = ev.boards;
    this.scaffold.attachments = ev.attachments;
  }

  create(customer: Customer) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.inspection.createdBy = user.id;
        this.inspection.createdByName = user.name;
        this.inspection.company = company;
        this.inspection.customer = customer;
        this.inspection.scaffold = this.scaffold;
        await this.upload();
        const doc = await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/inspections`, this.inspection);

        const res = await this.imgService.uploadBlob(
          this.blob,
          `company/${this.inspection.company.id}/inspections/${doc.id}/signature`,
          ''
        );
        if (res) {
          this.inspection.signature = res.url2;
          this.inspection.signatureRef = res.ref;
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.inspection.company.id}/inspections`,
              doc.id,
              this.inspection
            );
        }
        await this.masterSvc
          .edit()
          .updateDoc(`company/${company.id}/scaffolds`, this.scaffold.id, {
            latestInspection: this.inspection,
            status:
              this.inspection.status === 'Failed'
                ? 'inactive-Failed Inspection'
                : 'active-Handed over',
          });
        await this.masterSvc.edit().updateDoc('company', company.id, {
          totalInspections: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Inspection created successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your Inspection, Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  async sign(ev: { signature: string; name: string }) {
    this.blob = await (await fetch(ev.signature)).blob();
    this.inspection.signedBy = ev.name;
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.inspection.uploads.push(...newFiles);
  }

  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'addInspection');
  }
}
