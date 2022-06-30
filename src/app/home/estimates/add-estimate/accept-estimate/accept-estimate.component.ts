import { Component, Input, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-estimate',
  templateUrl: './accept-estimate.component.html',
})
export class AcceptEstimateComponent implements OnInit {
  @Input() form;
  @Input() estimate: Estimate;
  company: Company;
  user: User;
  page = 0;
  site: Site;
  sites$: Observable<Site[]>;
  form2: FormGroup;
  show = '';
  loading = false;

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
      name: this.estimate.siteName,
      suburb: '',
      totalScaffolds: 0,
      zip: '',
      companyId: this.company.id,
      createdBy: '',
      updatedBy: '',
      customer: this.estimate.customer,
      startDate: this.estimate.startDate,
      endDate: this.estimate.endDate,
      status: 'active',
      date: new Date(),
      users: [],
    };
    this.form2 = this.masterSvc.fb().group({
      site: ['', Validators.required],
      scaffold: ['', Validators.required],
    });
  }

  activate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        Object.assign(this.site, this.form2.get('site').value);
        const scaffold = this.field('scaffold', this.form2).value;
        this.estimate.poNumber = this.form.get('poNumber').value;
        this.estimate.woNumber = this.form.get('woNumber').value;
        this.estimate.siteId = this.site.id;
        this.estimate.siteName = this.site.name;
        this.estimate.customer = this.site.customer;
        this.estimate.acceptedBy = this.user.name;
        this.estimate.status = 'accepted';
        this.estimate.scaffoldCode = scaffold.code;

        const data = await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/scaffolds`, scaffold);
        this.estimate.scaffoldId = data.id;
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        let invoice: Invoice = {};
        const code = `INV${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(company.totalInvoices ? company.totalInvoices + 1 : 1)
          .toString()
          .padStart(6, '0')}`;
        Object.assign(invoice, {
          ...this.estimate,
          code: code,
          id: '',
          estimateCode: this.estimate.code,
          estimateId: this.estimate.id,
          date: new Date(),
          status: 'pending-Not Sent',
          totalOutstanding: this.estimate.total,
          totalPaid: 0,
          deposit: 0,
          depositType: 'Percent',
          depositTotal: 100,
        });

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/invoices`, invoice);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalInvoices: increment(1),
        });
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimates`,
            this.estimate.id,
            this.estimate
          );
        await this.masterSvc
          .edit()
          .updateDoc(`company/${this.company.id}/sites`, this.site.id, {
            totalScaffolds: increment(1),
          });
        if (this.estimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.company.id}/enquiries`,
              this.estimate.enquiryId,
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
    if (this.page === 0)
      this.masterSvc.modal().dismiss(undefined, 'close', 'acceptEstimate');
    this.page--;
  }

  field(field: string, form) {
    return form.get(field) as FormControl;
  }

  changeSite(site) {
    if (site !== 'add') {
      this.show = 'selectedSite';
      const code = `SCA${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${(site.totalScaffolds ? site.totalScaffolds + 1 : 1)
        .toString()
        .padStart(6, '0')}`;
      this.field('scaffold', this.form2).setValue({
        code,
        companyId: this.company.id,
        customerId: this.estimate.customer.id,
        siteId: site.id,
        siteCode: site.code,
        scaffold: this.estimate.scaffold,
        attachments: this.estimate.attachments,
        boards: this.estimate.boards,
        hire: this.estimate.hire,
        labour: this.estimate.labour,
        transport: this.estimate.transport,
        additionals: this.estimate.additionals,
        poNumber: this.estimate.poNumber,
        woNumber: this.estimate.woNumber,
        createdBy: this.user.id,
        startDate: this.estimate.startDate,
        endDate: this.estimate.endDate,
        date: new Date(),
        totalInspections: 0,
        totalHandovers: 0,
        totalModifications: 0,
        totalInvoices: 1,
        users: [],
        status: 'pending-Work In Progress',
      });
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
}
