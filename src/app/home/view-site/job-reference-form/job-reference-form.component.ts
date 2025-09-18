import { Component, inject, Input, OnInit } from '@angular/core';
import { arrayUnion, increment } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { JobReference } from 'src/app/models/jr.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-job-reference-form',
  templateUrl: './job-reference-form.component.html',
})
export class JobReferenceFormComponent implements OnInit {
  @Input() jobReference: JobReference = {};
  @Input() site: Site;

  protected company: Company;
  protected user: User;
  protected page = 0;

  private store = inject(Store);

  private editSvc = inject(EditService);
  private notificationSvc = inject(NotificationService);

  private modalController = inject(ModalController);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {}

  create() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        const company = this.store.selectSnapshot(CompanyState.company);
        const user = this.store.selectSnapshot(UserState.user);
        const estimate: EstimateV2 = {};
        estimate.jobReference = this.jobReference.jobReference;
        estimate.siteId = this.site.id;
        estimate.siteName = this.site.name;
        estimate.customer = this.site.customer;
        estimate.acceptedBy = user.name;
        estimate.status = 'accepted';
        estimate.items = [];

        const jr: JobReference = {};
        const code = this.editSvc.generateDocCode(
          company.totalJobReferences,
          'JR'
        );
        Object.assign(jr, {
          estimate,
          site: this.site,
          createdBy: user.id,
          createdByName: user.name,
          jobReference: this.jobReference.jobReference,
          code,
          id: '',
          date: new Date(),
          status: 'pending',
        });
        await this.editSvc.addDocument(
          `company/${company.id}/jobReferences`,
          jr
        );
        await this.editSvc.updateDoc('company', company.id, {
          totalJobReferences: increment(1),
        });
        await this.editSvc.updateDoc(
          `company/${company.id}/sites`,
          this.site.id,
          {
            jobReferenceList: arrayUnion(this.jobReference.jobReference),
          }
        );
        this.notificationSvc.toast(
          'Job Reference created successfully!',
          'success'
        );
      } catch (err) {
        this.notificationSvc.toast(
          'Something went wrong creating your jr, try again!',
          'danger',
          2000
        );
      }
    });
  }

  close() {
    if (this.page === 0) {
      this.modalController.dismiss(undefined, 'close', 'jobReferenceForm');
    }
    this.page--;
  }

  getStatus(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On-Hold':
        return 'tertiary';
      case 'Set up not yet completed':
        return 'warning';
      case 'Blocked':
        return 'danger';
      default:
        return 'primary';
    }
  }
}
