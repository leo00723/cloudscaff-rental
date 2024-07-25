import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SiteFormComponent } from 'src/app/components/site-form/site-form.component';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-inventory-estimate',
  templateUrl: './accept-inventory-estimate.component.html',
  styles: [],
})
export class AcceptInventoryEstimateComponent implements OnInit {
  @ViewChild('siteForm') siteForm: SiteFormComponent;
  @Input() form;
  @Input() inventoryEstimate: BulkInventoryEstimate;
  company: Company;
  user: User;
  page = 0;
  site: Site;
  sites$: Observable<Site[]>;
  form2: FormGroup;
  show = '';
  loading = false;
  data = [];
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {
    this.sites$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/sites`);
    this.site = {
      address: '',
      city: '',
      code: '',
      country: '',
      id: '',
      name: this.inventoryEstimate.siteName,
      suburb: '',
      totalScaffolds: 0,
      zip: '',
      companyId: this.company.id,
      createdBy: '',
      updatedBy: '',
      customer: this.inventoryEstimate.customer,
      startDate: this.inventoryEstimate.startDate,
      endDate: this.inventoryEstimate.endDate,
      status: 'active',
      date: new Date(),
      users: [],
    };
    this.form2 = this.masterSvc.fb().group({
      site: ['', Validators.required],
    });
  }

  activate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        Object.assign(this.site, this.form2.get('site').value);
        this.inventoryEstimate.poNumber = this.form.get('poNumber').value;
        this.inventoryEstimate.woNumber = this.form.get('woNumber').value;
        this.inventoryEstimate.siteId = this.site.id;
        this.inventoryEstimate.siteName = this.site.name;
        this.inventoryEstimate.customer = this.site.customer;
        this.inventoryEstimate.acceptedBy = this.user.name;
        this.inventoryEstimate.status = 'accepted';

        this.updateShipments(this.site);
        await this.getPlublishData();
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/inventoryEstimates`,
            this.inventoryEstimate.id,
            this.inventoryEstimate
          );
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/sites`,
            this.site.id,
            this.site
          );
        if (this.inventoryEstimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.company.id}/enquiries`,
              this.inventoryEstimate.enquiryId,
              {
                status: 'accepted',
              }
            );
        }
        this.masterSvc
          .notification()
          .toast('Estimate accepted successfully!', 'success');
        this.loading = false;
        this.masterSvc.modal().dismiss(undefined, 'close', 'acceptEstimate');
        this.masterSvc.modal().dismiss(undefined, 'close', 'editEstimate');

        this.masterSvc
          .store()
          .dispatch(new Navigate('/dashboard/inventory?page=3'));
      } catch (err) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong accepting your estimate, try again!',
            'danger',
            2000
          );
      }
    });
  }

  close() {
    if (this.page === 0) {
      this.masterSvc.modal().dismiss(undefined, 'close', 'acceptEstimate');
    }
    this.page--;
  }

  field(field: string, form) {
    return form.get(field) as FormControl;
  }

  changeSite(site) {
    if (site !== 'add') {
      this.updateShipments(site);
      this.show = 'selectedSite';
    } else {
      this.show = 'addSite';
    }
  }
  newSite(site: Site) {
    this.field('site', this.form2).setValue({ ...site });
    this.field('siteName', this.form).setValue(site.name);
    this.field('customer', this.form).setValue(site.customer);
    this.page = 2;
  }

  updateSite(site: Site) {
    this.field('site', this.form2).setValue({ ...site });
  }

  private updateShipments(site: Site) {
    this.data = [];
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    let shipmentNumber = company.totalShipments
      ? company.totalShipments + 1
      : 1;
    this.inventoryEstimate.estimates.forEach((e) => {
      e.site = site;
      e.siteName = this.inventoryEstimate.siteName;
      e.poNumber = this.inventoryEstimate.poNumber;
      e.woNumber = this.inventoryEstimate.woNumber;
      e.createdBy = this.user.id;
      e.status = 'pending';
      e.date = new Date();
      e.estimateId = this.inventoryEstimate.id;
      e.nextInvoiceDate = site.nextInvoiceDate;
      e.consumablesCharged = false;
      e.code = `DEL${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${shipmentNumber.toString().padStart(6, '0')}`;
      this.data.push(e);
      shipmentNumber++;
    });
  }

  private async getPlublishData() {
    for (const shipment of this.data) {
      await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/billableShipments`, shipment);
      await this.masterSvc.edit().updateDoc(`company`, this.company.id, {
        totalShipments: increment(1),
      });
    }
  }
}
