import { Component, inject, Input, OnInit } from '@angular/core';
import { arrayUnion, increment } from '@angular/fire/firestore';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { JobReference } from 'src/app/models/jr.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { JobReferenceUpdateService } from 'src/app/services/job-reference-update.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-job-reference-form',
  templateUrl: './job-reference-form.component.html',
})
export class JobReferenceFormComponent implements OnInit {
  @Input() set data(value: {
    jobReference: JobReference;
    site: Site;
    isEdit: boolean;
  }) {
    this.site = value.site;
    this.isEdit = value.isEdit;

    if (value.isEdit) {
      this.jobReference = value.jobReference;
    } else {
      Object.assign(this.jobReference, {
        discountPercentage: value.site.customer?.discountPercentage || 0,
        minHire: value.site.customer?.minHire || 0,
        paymentDays: value.site.customer?.paymentDays || 0,
      });
    }
  }

  protected jobReference: JobReference = {};
  protected site: Site;
  protected isEdit = false;

  protected company: Company;
  protected user: User;

  private store = inject(Store);

  private editSvc = inject(EditService);
  private notificationSvc = inject(NotificationService);
  private modalController = inject(ModalController);
  private lodingController = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private jobReferenceUpdateService = inject(JobReferenceUpdateService);

  private loading: HTMLIonLoadingElement;

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  async ngOnInit(): Promise<void> {
    this.loading = await this.lodingController.create({
      message: 'Please wait...',
      mode: 'ios',
    });
  }

  create() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        await this.loading.present();
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

        const code = this.editSvc.generateDocCode(
          company.totalJobReferences,
          'JR'
        );
        Object.assign(this.jobReference, {
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
          this.jobReference
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
        this.close();
      } catch (err) {
        console.log(err);
        this.notificationSvc.toast(
          'Something went wrong creating your Job Reference, try again!',
          'danger',
          2000
        );
      } finally {
        await this.loading.dismiss();
      }
    });
  }

  update() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        await this.loading.present();
        const company = this.store.selectSnapshot(CompanyState.company);

        await this.editSvc.addDocument(
          `company/${company.id}/jobReferences`,
          this.jobReference
        );

        this.notificationSvc.toast(
          'Job Reference updated successfully!',
          'success'
        );
      } catch (err) {
        this.notificationSvc.toast(
          'Something went wrong updating your Job Reference, try again!',
          'danger',
          2000
        );
      } finally {
        await this.loading.dismiss();
      }
    });
  }

  async updateJobReference() {
    try {
      // First, get count of affected records
      const updateCounts = await this.jobReferenceUpdateService.getUpdateCount(
        this.company.id,
        this.jobReference.site.id,
        this.jobReference.jobReference
      );

      const alert = await this.alertCtrl.create({
        header: 'Update Job Reference',
        message: `This will update ${updateCounts.total} related records including:
        • ${updateCounts.transactionLogs} transaction logs
        • ${updateCounts.shipments} shipments
        • ${updateCounts.adjustments} adjustments
        • ${updateCounts.returns} returns
        • ${updateCounts.invoices} invoices
        • ${updateCounts.transfers} transfers`,
        inputs: [
          {
            name: 'newJobReference',
            type: 'text',
            placeholder: 'Enter new Job Reference',
            value: this.jobReference.jobReference,
            attributes: {
              minlength: 1,
              required: true,
            },
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Update',
            handler: (data) => {
              if (
                data.newJobReference &&
                data.newJobReference !== this.jobReference.jobReference
              ) {
                this.performJobReferenceUpdate(data.newJobReference);
              }
            },
          },
        ],
        mode: 'ios',
      });

      await alert.present();
    } catch (error) {
      console.error('Error getting update count:', error);
      this.notificationSvc.toast(
        'Failed to load update information. Please try again.',
        'danger'
      );
    }
  }

  private async performJobReferenceUpdate(newJobReference: string) {
    this.notificationSvc.presentAlertConfirm(
      async () => {
        try {
          await this.loading.present();
          await this.jobReferenceUpdateService.updateJobReferenceAcrossCollections(
            this.company.id,
            this.jobReference.site.id,
            this.jobReference.jobReference,
            newJobReference,
            this.jobReference.id
          );
          this.jobReference.jobReference = newJobReference;
          this.notificationSvc.toast(
            'Job Reference updated successfully!',
            'success'
          );
        } catch (error) {
          console.error('Error updating Job Reference:', error);
          this.notificationSvc.toast(
            error.message ||
              'Failed to update Job Reference. Please try again.',
            'danger'
          );
        } finally {
          await this.loading.dismiss();
        }
      },
      'This action will update the Job Reference across all related records including ' +
        'transaction logs, shipments, adjustments, and returns. This cannot be undone.',
      'Update Job Reference'
    );
  }

  close() {
    this.modalController.dismiss(undefined, 'close', 'jobReferenceForm');
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
