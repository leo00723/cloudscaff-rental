import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
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
  page = 'po';
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
      company: this.company.id,
      createdBy: '',
      updatedBy: '',
      customer: this.estimate.customer,
      startDate: this.estimate.startDate,
      endDate: this.estimate.endDate,
      status: 'active',
      date: new Date(),
    };
    this.form2 = this.masterSvc.fb().group({
      site: ['', Validators.required],
    });
  }
  next(page: string) {
    if (page !== 'activate') {
      this.page = page;
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        Object.assign(this.site, this.form2.get('site').value);

        this.estimate.poNumber = this.form.get('poNumber').value;
        this.estimate.woNumber = this.form.get('woNumber').value;
        this.estimate.siteId = this.site.id;
        this.estimate.siteName = this.site.name;
        this.estimate.customer = this.site.customer;
        this.estimate.acceptedBy = this.user.name;
        this.estimate.status = 'accepted';
        this.loading = true;
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimates`,
            this.estimate.id,
            this.estimate
          )
          .then(() => {
            this.masterSvc
              .notification()
              .toast('Estimate accepted successfully!', 'success');
            this.loading = false;
            this.close();
            this.masterSvc.modal().dismiss(undefined, 'close', 'editEstimate');
            this.masterSvc
              .router()
              .navigateByUrl(
                `/dashboard/site/${this.company.id}-${this.site.id}`,
                {
                  replaceUrl: true,
                }
              );
          })
          .catch(() => {
            this.loading = false;
            this.masterSvc
              .notification()
              .toast(
                'Something went wrong accepting your estimate, try again!',
                'danger',
                2000
              );
          });
      });
    }
  }
  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'acceptEstimate');
  }
  field(field: string, form) {
    return form.get(field) as FormControl;
  }

  changeSite(args) {
    if (args !== 'add') {
      this.show = 'selectedSite';
    } else {
      this.show = 'addSite';
    }
  }
  newSite(site: Site) {
    this.field('site', this.form2).setValue({ ...site });
    this.field('siteName', this.form).setValue(site.name);
    this.field('customer', this.form).setValue(site.customer);
    this.page = 'activateEstimate';
  }
}
