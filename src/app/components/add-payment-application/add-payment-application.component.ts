import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Item } from 'src/app/models/item.model';
import { PaymentApplication } from 'src/app/models/paymentApplication.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-payment-application',
  templateUrl: './add-payment-application.component.html',
  styles: [
    `
      tr {
        font-size: 0.7rem;
      }
    `,
  ],
})
export class AddPaymentApplicationComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() site$: Observable<Site>;
  @Input() estimates$: Observable<Estimate[]>;
  @Input() bulkEstimates: BulkEstimate[];
  @Input() value: PaymentApplication;
  paymentApplication = new PaymentApplication();
  loading = false;
  company: Company;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    if (!this.isEdit) {
      this.paymentApplication.setCompany(this.company, true);
      this.subs.add(
        this.estimates$.subscribe((estimates) => {
          this.paymentApplication.setEstimates(estimates);
        })
      );
      this.subs.add(
        this.site$.subscribe((site) => {
          this.paymentApplication.setSite(site);
        })
      );
    } else {
      Object.assign(this.paymentApplication, this.value);
    }
  }

  createPA() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;

        this.paymentApplication.setCompany(this.company, true);
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.paymentApplication.company.id}/paymentApplications`,
            this.paymentApplication
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalPaymentApplications: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Payment application created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your payment application, try again!',
            'danger',
            2000
          );
      }
    });
  }

  updatePA() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.paymentApplication.setCompany(this.company);
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.paymentApplication.company.id}/paymentApplications`,
            this.paymentApplication.id,
            this.paymentApplication
          );
        this.loading = false;
        this.masterSvc
          .notification()
          .toast('Payment application updated successfully!', 'success');
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating your payment application, try again!',
            'danger',
            2000
          );
      }
    });
  }

  change(args, scaffold: Item, category: string) {
    const days = scaffold.isWeeks
      ? +scaffold.daysStanding / 7
      : +scaffold.daysStanding;
    switch (category) {
      case 'EP':
        {
          scaffold.appliedErectionPercentage = args.detail.value;
          scaffold.appliedErectionValue =
            (scaffold.total + scaffold.hireTotal) *
            0.7 *
            (scaffold.appliedErectionPercentage / 100);
        }
        break;
      case 'DP':
        {
          scaffold.appliedDismantlePercentage = args.detail.value;
          scaffold.appliedDismantleValue =
            (scaffold.total + scaffold.hireTotal) *
            0.3 *
            (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'HD':
        {
          scaffold.hireDate = args.detail.value;
          const hireEndDate = new Date(args.detail.value);
          hireEndDate.setDate(hireEndDate.getDate() + days);
          scaffold.hireEndDate = hireEndDate.toDateString();
        }
        break;
      case 'DD':
        {
          scaffold.dismantleDate = args.detail.value;
        }
        break;
      case 'EH':
        {
          scaffold.extraHireWeeks = +args.detail.value;
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
    }

    const EH = scaffold.extraHireCharge ? scaffold.extraHireCharge : 0;
    const EV = scaffold.appliedErectionValue
      ? scaffold.appliedErectionValue
      : 0;
    const DV = scaffold.appliedDismantleValue
      ? scaffold.appliedDismantleValue
      : 0;
    scaffold.grossTotal = EV + DV + EH;
    scaffold.currentTotal =
      scaffold.grossTotal -
      (scaffold.previousGross ? +scaffold.previousGross : 0);
    this.paymentApplication.updateTotals();
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
}
