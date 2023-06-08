import { Component, Input, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-bulk-estimate',
  templateUrl: './accept-bulk-estimate.component.html',
  styles: [],
})
export class AcceptBulkEstimateComponent implements OnInit {
  @Input() form;
  @Input() bulkEstimate: BulkEstimate;
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
      name: this.bulkEstimate.siteName,
      suburb: '',
      totalScaffolds: 0,
      zip: '',
      companyId: this.company.id,
      createdBy: '',
      updatedBy: '',
      customer: this.bulkEstimate.customer,
      startDate: this.bulkEstimate.startDate,
      endDate: this.bulkEstimate.endDate,
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
        this.bulkEstimate.poNumber = this.form.get('poNumber').value;
        this.bulkEstimate.woNumber = this.form.get('woNumber').value;
        this.bulkEstimate.siteId = this.site.id;
        this.bulkEstimate.siteName = this.site.name;
        this.bulkEstimate.customer = this.site.customer;
        this.bulkEstimate.acceptedBy = this.user.name;
        this.bulkEstimate.status = 'accepted';

        this.updateScaffolds(this.site);
        this.getPlublishData();
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkEstimates`,
            this.bulkEstimate.id,
            this.bulkEstimate
          );
        if (this.bulkEstimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.company.id}/enquiries`,
              this.bulkEstimate.enquiryId,
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
          .dispatch(
            new Navigate(`/dashboard/site/${this.company.id}-${this.site.id}`)
          );
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
      this.updateScaffolds(site);
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

  private updateScaffolds(site: Site) {
    this.data = [];
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    let scaffoldNumber = site.totalScaffolds ? site.totalScaffolds + 1 : 1;
    let invoiceNumber = company.totalInvoices ? company.totalInvoices + 1 : 1;
    this.bulkEstimate.estimates.forEach((e) => {
      e.siteId = this.bulkEstimate.siteId;
      e.siteName = this.bulkEstimate.siteName;
      const scaffold = this.createScaffold(e, site, scaffoldNumber);
      const invoice = this.createInvoice(e, invoiceNumber);
      this.data.push({ scaffold, invoice });
      scaffoldNumber++;
      invoiceNumber++;
    });
  }

  private createScaffold(
    estimate: Estimate,
    site: Site,
    scaffoldNumber: number
  ) {
    const code = `SCA${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${scaffoldNumber.toString().padStart(6, '0')}`;
    const scaffold: Scaffold = {
      code,
      companyId: this.company.id,
      customerId: this.bulkEstimate.customer.id,
      siteId: site.id,
      siteCode: site.code,
      scaffold: estimate.scaffold,
      attachments: estimate.attachments,
      boards: estimate.boards,
      hire: estimate.hire,
      labour: estimate.labour,
      transport: estimate.transport,
      additionals: estimate.additionals,
      poNumber: this.bulkEstimate.poNumber,
      woNumber: this.bulkEstimate.woNumber,
      createdBy: this.user.id,
      startDate: this.bulkEstimate.startDate,
      endDate: this.bulkEstimate.endDate,
      date: new Date(),
      totalInspections: 0,
      totalHandovers: 0,
      totalModifications: 0,
      totalInvoices: 1,
      users: [],
      status: 'pending-Work In Progress',
    };
    return scaffold;
  }
  private createInvoice(estimate: Estimate, invoiceNumber: number) {
    // create invoice for each scaffold
    const invoice: Invoice = {};
    const code = `INV${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${invoiceNumber.toString().padStart(6, '0')}`;
    Object.assign(invoice, {
      ...estimate,
      code,
      id: '',
      estimateCode: this.bulkEstimate.code,
      estimateId: this.bulkEstimate.id,
      date: new Date(),
      status: 'pending-Not Sent',
      totalOutstanding: estimate.total,
      totalPaid: 0,
      deposit: 0,
      depositType: 'Percent',
      depositTotal: estimate.total,
    });
    return invoice;
  }
  private async getPlublishData() {
    this.data.forEach(async (d) => {
      const scaffold = await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/scaffolds`, d.scaffold);
      await this.masterSvc
        .edit()
        .updateDoc(`company/${this.company.id}/sites`, this.site.id, {
          totalScaffolds: increment(1),
        });
      const invoice = d.invoice;
      invoice.scaffoldId = scaffold.id;
      invoice.scaffoldCode = d.scaffold.code;
      await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/invoices`, invoice);
      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        totalInvoices: increment(1),
      });
    });
  }
}
