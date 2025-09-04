import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { POUpdateService } from 'src/app/services/po-update.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PO } from 'src/app/models/po.model';

@Component({
  selector: 'app-po-number-manager',
  templateUrl: './po-number-manager.component.html',
  styleUrls: ['./po-number-manager.component.scss'],
})
export class PONumberManagerComponent implements OnInit {
  @Input() pos: PO[] = [];
  @Input() companyId: string;

  searchTerm = '';
  filteredPOs: PO[] = [];
  selectedPO: PO | null = null;
  newPONumber = '';
  updating = false;
  updateCounts: any = null;

  constructor(
    private modalCtrl: ModalController,
    private poUpdateSvc: POUpdateService,
    private notificationSvc: NotificationService
  ) {}

  ngOnInit() {
    this.filteredPOs = [...this.pos];
  }

  filterPOs() {
    if (!this.searchTerm) {
      this.filteredPOs = [...this.pos];
      return;
    }

    this.filteredPOs = this.pos.filter(
      (po) =>
        po.jobReference
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        po.code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        po.site?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  async selectPO(po: PO) {
    this.selectedPO = po;
    this.newPONumber = po.jobReference || '';

    try {
      this.updateCounts = await this.poUpdateSvc.getUpdateCount(
        this.companyId,
        po.site?.id || '',
        po.jobReference || ''
      );
    } catch (error) {
      console.error('Error getting update count:', error);
      this.notificationSvc.toast('Failed to load impact analysis', 'warning');
    }
  }

  goBack() {
    this.selectedPO = null;
    this.newPONumber = '';
    this.updateCounts = null;
  }

  async updatePONumber() {
    if (!this.selectedPO || !this.newPONumber) {
      return;
    }

    const message = `This will update ${
      this.updateCounts?.total || 0
    } related records. This action cannot be undone.`;

    this.notificationSvc.presentAlertConfirm(
      async () => {
        try {
          this.updating = true;
          await this.poUpdateSvc.updatePONumberAcrossCollections(
            this.companyId,
            this.selectedPO.site.id,
            this.selectedPO.jobReference,
            this.newPONumber,
            this.selectedPO.id
          );

          // Update the local PO object
          this.selectedPO.jobReference = this.newPONumber;

          // Update the PO in the list
          const index = this.pos.findIndex((p) => p.id === this.selectedPO.id);
          if (index > -1) {
            this.pos[index].jobReference = this.newPONumber;
          }

          this.notificationSvc.toast(
            'PO number updated successfully!',
            'success'
          );
          this.close();
        } catch (error) {
          console.error('Error updating PO number:', error);
          this.notificationSvc.toast(
            error.message || 'Failed to update PO number. Please try again.',
            'danger'
          );
        } finally {
          this.updating = false;
        }
      },
      message,
      'Confirm PO Number Update'
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
