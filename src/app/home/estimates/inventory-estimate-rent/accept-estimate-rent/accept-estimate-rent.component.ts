import { Component, inject, Input, OnInit } from '@angular/core';
import { arrayUnion, increment, where } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { InventoryEstimateRent } from 'src/app/models/inventory-estimate-rent.model';
import { PO } from 'src/app/models/po.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { MasterService } from 'src/app/services/master.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-estimate-rent',
  templateUrl: './accept-estimate-rent.component.html',
})
export class AcceptEstimateRentComponent implements OnInit {
  @Input() form;
  @Input() estimate: InventoryEstimateRent;
  company: Company;
  user: User;
  page = 0;
  site: Site;
  sites$: Observable<Site[]>;
  form2: FormGroup;
  show = '';
  loading = false;

  private store = inject(Store);
  private editSvc = inject(EditService);
  private notification = inject(NotificationService);
  private modal = inject(ModalController);
  private fb = inject(FormBuilder);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {
    this.sites$ = this.editSvc.getCollectionFiltered(
      `company/${this.company.id}/sites`,
      [where('status', '==', 'active')]
    );
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
    this.form2 = this.fb.group({
      site: ['', Validators.required],
    });
  }

  activate() {
    this.notification.presentAlertConfirm(async () => {
      try {
        this.loading = true;
        Object.assign(this.site, this.form2.get('site').value);
        this.estimate.poNumber = this.form.get('poNumber').value;
        this.estimate.siteId = this.site.id;
        this.estimate.siteName = this.site.name;
        this.estimate.customer = this.site.customer;
        this.estimate.acceptedBy = this.user.name;
        this.estimate.status = 'accepted';

        const company = this.store.selectSnapshot(CompanyState.company);
        const po: PO = {};
        const code = this.editSvc.generateDocCode(company.totalPOs, 'PO');
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
          type: 'Rental',
        });

        await this.editSvc.addDocument(`company/${this.company.id}/pos`, po);
        await this.editSvc.updateDoc('company', this.company.id, {
          totalPOs: increment(1),
        });
        await this.editSvc.updateDoc(
          `company/${this.company.id}/inventoryEstimatesRent`,
          this.estimate.id,
          this.estimate
        );
        await this.editSvc.updateDoc(
          `company/${this.company.id}/sites`,
          this.site.id,
          {
            poList: arrayUnion(this.estimate.poNumber),
          }
        );

        this.notification.toast('Estimate accepted successfully!', 'success');
        this.loading = false;
        this.modal.dismiss(undefined, 'close', 'acceptRentalEstimate');
        this.modal.dismiss(undefined, 'close', 'editRentEstimate');

        this.store.dispatch(
          new Navigate(`/dashboard/site/${this.company.id}-${this.site.id}`)
        );
      } catch (err) {
        this.loading = false;
        this.notification.toast(
          'Something went wrong accepting your estimate, try again!',
          'danger',
          2000
        );
      }
    });
  }

  close() {
    if (this.page === 0) {
      this.modal.dismiss(undefined, 'close', 'acceptEstimate');
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
