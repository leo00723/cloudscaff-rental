import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JobReference } from 'src/app/models/jr.model';
import { JobReferenceUpdateService } from 'src/app/services/job-reference-update.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-job-reference-number-manager',
  templateUrl: './job-reference-number-manager.component.html',
  styleUrls: ['./job-reference-number-manager.component.scss'],
})
export class JobReferenceManagerComponent implements OnInit {
  @Input() pos: JobReference[] = [];
  @Input() companyId: string;

  searchTerm = '';
  filteredJobReferences: JobReference[] = [];
  selectedJobReference: JobReference | null = null;
  newJobReference = '';
  updating = false;
  updateCounts: any = null;

  constructor(
    private modalCtrl: ModalController,
    private jobReferenceUpdateSvc: JobReferenceUpdateService,
    private notificationSvc: NotificationService
  ) {}

  ngOnInit() {
    this.filteredJobReferences = [...this.pos];
  }

  filterJobReferences() {
    if (!this.searchTerm) {
      this.filteredJobReferences = [...this.pos];
      return;
    }

    this.filteredJobReferences = this.pos.filter(
      (jr) =>
        jr.jobReference
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        jr.code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        jr.site?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  async selectJobReference(jr: JobReference) {
    this.selectedJobReference = jr;
    this.newJobReference = jr.jobReference || '';

    try {
      this.updateCounts = await this.jobReferenceUpdateSvc.getUpdateCount(
        this.companyId,
        jr.site?.id || '',
        jr.jobReference || ''
      );
    } catch (error) {
      console.error('Error getting update count:', error);
      this.notificationSvc.toast('Failed to load impact analysis', 'warning');
    }
  }

  goBack() {
    this.selectedJobReference = null;
    this.newJobReference = '';
    this.updateCounts = null;
  }

  async updateJobReference() {
    if (!this.selectedJobReference || !this.newJobReference) {
      return;
    }

    const message = `This will update ${
      this.updateCounts?.total || 0
    } related records. This action cannot be undone.`;

    this.notificationSvc.presentAlertConfirm(
      async () => {
        try {
          this.updating = true;
          await this.jobReferenceUpdateSvc.updateJobReferenceAcrossCollections(
            this.companyId,
            this.selectedJobReference.site.id,
            this.selectedJobReference.jobReference,
            this.newJobReference,
            this.selectedJobReference.id
          );

          // Update the local Job Reference object
          this.selectedJobReference.jobReference = this.newJobReference;

          // Update the Job Reference in the list
          const index = this.pos.findIndex(
            (p) => p.id === this.selectedJobReference.id
          );
          if (index > -1) {
            this.pos[index].jobReference = this.newJobReference;
          }

          this.notificationSvc.toast(
            'Job Reference updated successfully!',
            'success'
          );
          this.close();
        } catch (error) {
          console.error('Error updating Job Reference:', error);
          this.notificationSvc.toast(
            error.message ||
              'Failed to update Job Reference. Please try again.',
            'danger'
          );
        } finally {
          this.updating = false;
        }
      },
      message,
      'Confirm Job Reference Update'
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
