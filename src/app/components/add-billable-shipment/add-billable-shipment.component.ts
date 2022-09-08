import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-billable-shipment',
  templateUrl: './add-billable-shipment.component.html',
  styles: [],
})
export class AddBillableShipmentComponent {
  @Input() isEdit = false;
  @Input() set value(val: InventoryEstimate) {
    if (val) {
      Object.assign(this.shipment, val);
    }
  }
  shipment: InventoryEstimate = {
    additionals: [],
    broker: undefined,
    code: '',
    company: undefined,
    customer: undefined,
    date: undefined,
    discount: 0,
    discountPercentage: 0,
    endDate: undefined,
    id: '',
    labour: [],
    transport: [],
    transportProfile: [],
    message: '',
    siteName: '',
    startDate: undefined,
    status: '',
    daysOnHire: 0,
    minHire: 0,
    itemHire: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    extraHire: 0,
    vat: 0,
    poNumber: '',
    woNumber: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
    enquiryId: '',
  };
  loading = false;
  company: Company;

  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  updateShipment(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        this.shipment.status = status;
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/billableShipments`,
            this.shipment.id,
            this.shipment
          );
        this.masterSvc
          .notification()
          .toast('Shipment updated successfully', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the shipment. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
}
