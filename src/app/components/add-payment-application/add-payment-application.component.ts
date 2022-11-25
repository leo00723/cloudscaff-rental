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
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

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
  @Input() set value(val: PaymentApplication) {
    if (val) {
      Object.assign(this.paymentApplication, val);
    }
  }
  terms$: Observable<Term>;
  paymentApplication = new PaymentApplication();
  loading = false;
  company: Company;
  types = [
    {
      title: 'Measured Work',
      type1: 'measured',
      type2: 'measured-custom',
    },
    {
      title: 'Variation Orders',
      type1: 'variation',
      type2: 'variation-custom',
    },
    // {
    //   title: 'Daily Works',
    //   type1: 'daily-works',
    //   type2: 'daily-works-custom',
    // },
  ];
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Payment');
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
                    erectionValue: e.scaffold.total * 0.7,
                    dismantleValue: e.scaffold.total * 0.3,
                  },
                  attachments: e.attachments.map((a) => ({
                    ...a,
                    total: a.total + (a.hireTotal ? a.hireTotal : 0),
                    erectionValue: a.total * 0.7,
                    dismantleValue: a.total * 0.3,
                  })),
                  additionals: e.additionals.map((a) => ({
                    ...a,
                    total: a.total,
                    erectionValue: a.total * 0.7,
                    dismantleValue: a.total * 0.3,
                  })),
                  labour: e.labour.map((a) => ({
                    ...a,
                    total: a.total,
                  })),
                  transport: e.transport.map((a) => ({
                    ...a,
                    total: a.total,
                  })),
                  boards: e.boards.map((a) => ({
                    ...a,
                    total: a.total,
                  })),
                  type: e.type,
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
    }
  }

  createPA(create?: boolean) {
    const canMakePA = create ? create : this.isPA;
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.paymentApplication.setCompany(this.company, true, canMakePA);
        if (canMakePA) {
          await this.masterSvc
            .edit()
            .addDocument(
              `company/${this.paymentApplication.company.id}/paymentApplications`,
              { ...this.paymentApplication, status: 'pending' }
            );

          await this.masterSvc.edit().updateDoc('company', this.company.id, {
            totalPaymentApplications: increment(1),
          });
          if (create) {
            await this.masterSvc
              .edit()
              .updateDoc(
                `company/${this.paymentApplication.company.id}/operationApplications`,
                this.paymentApplication.id,
                { status: 'P.A Created' }
              );
          }

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

        this.close();
      } catch (error) {
        console.error(error);
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

  close() {
    this.masterSvc.modal().dismiss();
  }

  async download(terms: Term | null) {
    // const sharedPaymentApplication = {
    //   paymentApplication: this.paymentApplication,
    //   company: this.company,
    //   terms,
    // };
    // await this.masterSvc
    //   .edit()
    //   .updateDoc(
    //     'sharedEstimates',
    //     `${this.company.id}-${this.paymentApplication.id}`,
    //     {
    //       ...sharedPaymentApplication,
    //       cc: [],
    //       email: [this.paymentApplication.company.email],
    //     }
    //   );
    const pdf = await this.masterSvc
      .pdf()
      .generatePaymentApplication(this.paymentApplication, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.paymentApplication.code);
  }
  async share(terms: Term | null) {
    const sharedPaymentApplication = {
      estimate: this.paymentApplication,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: {
          type: 'paymentApplication',
          doc: sharedPaymentApplication,
        },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
