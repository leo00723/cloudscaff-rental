import { Component, Input, OnInit } from '@angular/core';
import { arrayUnion, increment, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { PO } from 'src/app/models/po.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-estimate-v2',
  templateUrl: './accept-estimate-v2.component.html',
})
export class AcceptEstimateV2Component implements OnInit {
  @Input() form;
  @Input() estimate: EstimateV2;
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
      .getCollectionFiltered(`company/${this.company.id}/sites`, [
        where('status', '==', 'active'),
      ]);
    this.site = {
      address: '',
      city: '',
      code: '',
      companyId: this.company.id,
      country: '',
      createdBy: '',
      customer: this.estimate.customer,
      date: new Date(),
      endDate: undefined,
      id: '',
      name: this.estimate.siteName,
      startDate: undefined,
      status: 'active',
      suburb: '',
      totalScaffolds: 0,
      updatedBy: '',
      users: [],
      zip: '',
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
        this.estimate.poNumber = this.form.get('poNumber').value;
        this.estimate.siteId = this.site.id;
        this.estimate.siteName = this.site.name;
        this.estimate.customer = this.site.customer;
        this.estimate.acceptedBy = this.user.name;
        this.estimate.status = 'accepted';

        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        const po: PO = {};
        const code = this.masterSvc
          .edit()
          .generateDocCode(company.totalPOs, 'PO');
        Object.assign(po, {
          estimate: this.estimate,
          site: this.site,
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
          .addDocument(`company/${this.company.id}/pos`, po);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalPOs: increment(1),
        });
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimatesV2`,
            this.estimate.id,
            this.estimate
          );
        await this.masterSvc
          .edit()
          .updateDoc(`company/${this.company.id}/sites`, this.site.id, {
            poList: arrayUnion(this.estimate.poNumber),
          });
        // if (this.estimate.enquiryId.length > 0) {
        //   await this.masterSvc
        //     .edit()
        //     .updateDoc(
        //       `company/${this.company.id}/enquiries`,
        //       this.estimate.enquiryId,
        //       {
        //         status: 'accepted',
        //       }
        //     );
        // }
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
      this.show = 'selectedSite';
      this.site.name = site.name;
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
