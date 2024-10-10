import { Component, Input, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimateSell } from 'src/app/models/inventory-estimate-sell.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-estimate-sell',
  templateUrl: './accept-estimate-sell.component.html',
})
export class AcceptEstimateSellComponent implements OnInit {
  @Input() form;
  @Input() estimate: InventoryEstimateSell;
  company: Company;
  user: User;
  page = 0;
  show = '';
  loading = false;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {}

  accept() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.estimate.poNumber = this.form.get('poNumber').value;
        this.estimate.acceptedBy = this.user.name;
        this.estimate.status = 'accepted';

        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        const code = this.masterSvc
          .edit()
          .generateDocCode(company.totalSaleInvoices, 'INVS');
        const invoice = {};
        Object.assign(invoice, {
          estimate: this.estimate,
          createdBy: this.user.id,
          createdByName: this.user.name,
          poNumber: this.estimate.poNumber,
          code,
          id: '',
          date: new Date(),
          status: 'pending',
        });

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/saleInvoices`, invoice);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalSaleInvoices: increment(1),
        });
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/inventoryEstimatesSell`,
            this.estimate.id,
            this.estimate
          );
        this.masterSvc
          .notification()
          .toast('Estimate accepted successfully!', 'success');
        this.masterSvc
          .modal()
          .dismiss(undefined, 'close', 'acceptSellEstimate');
        this.masterSvc.modal().dismiss(undefined, 'close', 'editSellEstimate');
      } catch (err) {
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong accepting your estimate, try again!',
            'danger',
            2000
          );
      } finally {
        this.loading = false;
      }
    });
  }

  close() {
    if (this.page === 0) {
      this.masterSvc.modal().dismiss(undefined, 'close', 'acceptSellEstimate');
    }
    this.page--;
  }

  field(field: string, form) {
    return form.get(field) as FormControl;
  }
}
