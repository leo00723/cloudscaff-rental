import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-accept-estimate',
  templateUrl: './accept-estimate.component.html',
})
export class AcceptEstimateComponent implements OnInit {
  @Input() form;
  @Input() company: Company;
  @Input() user: any;
  @Input() estimate: Estimate;
  page = 'po';
  site: Site;
  sites$: Observable<Site[]>;
  form2: FormGroup;
  show = '';
  loading = false;

  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    this.sites$ = this.masterSvc
      .edit()
      .getDocsByCompanyId(`company/${this.company.id}/sites`);
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
  newSite(args) {
    this.field('site', this.form2).setValue({ ...args });
  }
}
