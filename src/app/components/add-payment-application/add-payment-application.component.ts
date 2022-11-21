import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { map, Observable, Subscription } from 'rxjs';
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
  @Input() isPA = false;
  @Input() site$: Observable<Site>;
  @Input() estimates$: Observable<Estimate[]>;
  @Input() bulkEstimates: BulkEstimate[];
  @Input() value: PaymentApplication;
  paymentApplication = new PaymentApplication();
  loading = false;
  company: Company;
  editField = false;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    if (!this.isEdit) {
      this.paymentApplication.setCompany(this.company, true, this.isPA);
      this.subs.add(
        this.estimates$
          .pipe(
            map((data) =>
              data.map((e) => {
                const obj = {
                  id: e.id,
                  code: e.code,
                  scaffold: {
                    ...e.scaffold,
                    total:
                      e.scaffold.total +
                      (e.scaffold.hireTotal ? e.scaffold.hireTotal : 0),
                  },
                  attachments: e.attachments.map((a) => ({
                    ...a,
                    total: a.total + (a.hireTotal ? a.hireTotal : 0),
                  })),
                } as Estimate;
                return obj;
              })
            )
          )
          .subscribe((estimates) => {
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

  createPA(create?: boolean) {
    const canMakePA = create ? create : this.isPA;
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;

        this.paymentApplication.setCompany(this.company, true, this.isPA);
        if (canMakePA) {
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
        } else {
          await this.masterSvc
            .edit()
            .addDocument(
              `company/${this.paymentApplication.company.id}/operationApplications`,
              this.paymentApplication
            );

          await this.masterSvc.edit().updateDoc('company', this.company.id, {
            totalOperationApplications: increment(1),
          });

          this.masterSvc
            .notification()
            .toast('Operation application created successfully!', 'success');
        }
        if (create) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.paymentApplication.company.id}/${
                this.isPA ? 'paymentApplications' : 'operationApplications'
              }`,
              this.paymentApplication.id,
              { status: 'P.A Created' }
            );
        }
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
            `company/${this.paymentApplication.company.id}/${
              this.isPA ? 'paymentApplications' : 'operationApplications'
            }`,
            this.paymentApplication.id,
            this.paymentApplication
          );
        // const est = this.paymentApplication.updatePreviousGross();
        // const batch = this.masterSvc.edit().batch();
        // for (const e of est) {
        //   const doc = this.masterSvc
        //     .edit()
        //     .docRef(`company/${this.company.id}/estimates`, e.id);
        //   batch.set(doc, { ...e }, { merge: true });
        // }

        // await batch.commit();
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            `${
              this.isPA ? 'Payment' : 'Operation'
            } application updated successfully!`,
            'success'
          );
      } catch (error) {
        console.error(error);
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
    const value = args.detail.value;
    const days = scaffold.isWeeks
      ? +scaffold.daysStanding / 7
      : +scaffold.daysStanding;
    switch (category) {
      case 'EP':
        {
          scaffold.appliedErectionPercentage = value;
          scaffold.appliedErectionValue =
            scaffold.total * 0.7 * (scaffold.appliedErectionPercentage / 100);
        }
        break;
      case 'DP':
        {
          scaffold.appliedDismantlePercentage = value;
          scaffold.appliedDismantleValue =
            scaffold.total * 0.3 * (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'HD':
        {
          scaffold.hireDate = value;
          const hireEndDate = new Date(value);
          hireEndDate.setDate(hireEndDate.getDate() + days);
          scaffold.hireEndDate = hireEndDate.toDateString();
        }
        break;
      case 'DD':
        {
          scaffold.dismantleDate = value;
        }
        break;
      case 'EH':
        {
          scaffold.extraHireWeeks = +value;
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
      case 'SD':
        {
          scaffold.description = value;
        }
        break;
      case 'SV':
        {
          scaffold.total = +value;
        }
        break;
      case 'SH':
        {
          scaffold.isWeeks = false;
          scaffold.daysStanding = +value * 7;
          const hireEndDate = new Date(scaffold.hireDate);
          hireEndDate.setDate(hireEndDate.getDate() + scaffold.daysStanding);
          scaffold.hireEndDate = hireEndDate.toDateString();
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

  setDate(args) {
    this.paymentApplication.dueDate = args.detail.value;
  }

  addItem() {
    const newEstimate: Estimate = {
      additionals: [],
      attachments: [],
      boards: [],
      broker: undefined,
      code: '',
      company: this.paymentApplication.company,
      customer: this.paymentApplication.site.customer,
      date: new Date(),
      discount: 0,
      discountPercentage: 0,
      endDate: undefined,
      hire: undefined,
      id: '',
      labour: [],
      transport: [],
      transportProfile: [],
      message: '',
      scaffold: {},
      siteName: this.paymentApplication.site.name,
      startDate: new Date(),
      status: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      extraHire: 0,
      vat: 0,
      poNumber: '',
      woNumber: '',
      siteId: '',
      scaffoldId: '',
      scaffoldCode: '',
      createdBy: '',
      updatedBy: '',
      acceptedBy: '',
      rejectedBy: '',
      enquiryId: '',
      type: 'custom',
    };
    this.paymentApplication.estimates.push(newEstimate);
  }

  deleteItem(index: number) {
    this.paymentApplication.estimates.splice(index, 1);
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
}
