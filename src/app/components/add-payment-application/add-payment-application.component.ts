/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { Observable, Subscription, map, zip } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { PaymentApplication } from 'src/app/models/paymentApplication.model';
import { Site } from 'src/app/models/site.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { XeroService } from 'src/app/services/xero.service';
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
  @Input() siteId = '';
  @Input() site$: Observable<Site>;
  @Input() set value(val: PaymentApplication) {
    if (val) {
      Object.assign(this.paymentApplication, val);
      this.paymentApplication.updateTotals();
    }
  }
  bulkEstimates$: Observable<Estimate[]>;
  estimates$: Observable<Estimate[]>;
  terms$: Observable<Term>;
  paymentApplication = new PaymentApplication();
  loading = false;
  company: Company;
  types = [
    {
      title: 'Measured Work',
      type1: 'measured',
      type2: 'measured-custom',
      type3: 'bulk-measured',
    },
    {
      title: 'Variation Orders',
      type1: 'variation',
      type2: 'variation-custom',
    },
  ];
  private subs = new Subscription();
  constructor(private masterSvc: MasterService, private xero: XeroService) {
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
      this.paymentApplication.setCompany(this.company, true);
      this.subs.add(
        this.site$.subscribe((site) => {
          this.paymentApplication.setSite(site);
        })
      );
    }
    this.init();
    this.subs.add(
      zip(this.estimates$, this.bulkEstimates$)
        .pipe(map(([es, bes]) => [...es, ...bes]))
        .subscribe((estimates) => {
          if (estimates.length > 0) {
            console.log(estimates);
            this.paymentApplication.setEstimates(estimates);
          }
        })
    );
  }

  createPA() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.paymentApplication.setCompany(this.company, true);
        const data = JSON.parse(JSON.stringify(this.paymentApplication));
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.paymentApplication.company.id}/paymentApplications`,
            { ...data, status: 'pending' }
          );

        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalPaymentApplications: increment(1),
        });

        const batch = this.masterSvc.edit().batch();
        for (const e of this.paymentApplication.estimates) {
          if (e.id && e.code) {
            if (e.type === 'measured') {
              const doc = this.masterSvc
                .edit()
                .docRef(`company/${this.company.id}/estimates`, e.id);
              batch.update(doc, { addedToPA: true });
            } else if (e.type === 'bulk-measured') {
              const id = e.id.split('-')[0];
              const doc = this.masterSvc
                .edit()
                .docRef(`company/${this.company.id}/bulkEstimates`, id);
              batch.update(doc, { addedToPA: true });
            }
          }
        }
        await batch.commit();

        this.masterSvc
          .notification()
          .toast('Payment application created successfully!', 'success');

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
            `company/${this.paymentApplication.company.id}/paymentApplications`,
            this.paymentApplication.id,
            this.paymentApplication
          );
        // const est = this.paymentApplication.updatePreviousGross();
        const batch = this.masterSvc.edit().batch();
        for (const e of this.paymentApplication.estimates) {
          if (e.id && e.code && !e.addedToPA) {
            if (e.type === 'measured') {
              const doc = this.masterSvc
                .edit()
                .docRef(`company/${this.company.id}/estimates`, e.id);
              batch.update(doc, { addedToPA: true });
            } else if (e.type === 'bulk-measured') {
              const id = e.id.split('-')[0];
              const doc = this.masterSvc
                .edit()
                .docRef(`company/${this.company.id}/bulkEstimates`, id);
              batch.update(doc, { addedToPA: true });
            }
          }
        }
        await batch.commit();

        this.loading = false;
        this.masterSvc
          .notification()
          .toast('Payment application updated successfully!', 'success');
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

  createInvoice(site: Site) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const response = await this.xero.updateInvoice(this.company, {
        Type: 'ACCREC',
        Contact: {
          ContactID: site.customer.xeroID,
        },
        DateString: new Date().toISOString(),
        DueDateString: this.paymentApplication.dueDate,
        LineAmountTypes: 'Inclusive',
        Reference: this.paymentApplication.code,
        LineItems: [
          {
            Description: 'Payment application',
            Quantity: '1',
            UnitAmount: this.paymentApplication.total,
            AccountCode: '200',
            Tracking: [
              {
                Name: 'Site',
                Option: site.code,
              },
            ],
          },
        ],
      });
      this.masterSvc
        .notification()
        .toast('Invoice created Successfully', 'success');
      console.log(response);
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

  private init() {
    this.estimates$ = this.masterSvc
      .edit()
      .getCollectionWhereWhereAndOrder(
        `company/${this.company.id}/estimates`,
        'siteId',
        '==',
        this.siteId,
        'addedToPA',
        '==',
        false,
        'date',
        'desc'
      )
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
                erectionValue:
                  e.scaffold.total +
                  (e.scaffold.hireTotal ? e.scaffold.hireTotal : 0) * 0.7,
                dismantleValue:
                  e.scaffold.total +
                  (e.scaffold.hireTotal ? e.scaffold.hireTotal : 0) * 0.3,
              },
              attachments: e.attachments.map((a) => ({
                ...a,
                total: a.total + (a.hireTotal ? a.hireTotal : 0),
                erectionValue: a.total + (a.hireTotal ? a.hireTotal : 0) * 0.7,
                dismantleValue: a.total + (a.hireTotal ? a.hireTotal : 0) * 0.3,
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
              addedToPA: e.addedToPA,
            } as Estimate;
            return obj;
          })
        )
      ) as Observable<Estimate[]>;

    this.bulkEstimates$ = this.masterSvc
      .edit()
      .getCollectionWhereWhereAndOrder(
        `company/${this.company.id}/bulkEstimates`,
        'siteId',
        '==',
        this.siteId,
        'addedToPA',
        '==',
        false,
        'date',
        'desc'
      )
      .pipe(
        map((data) => {
          const est: Estimate[] = [];
          data.map((be: BulkEstimate) => {
            be.estimates.map((e, i) => {
              const obj = {
                id: `${be.id}-${i}`,
                code: be.code,
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
                type: be.type,
                addedToPA: be.addedToPA,
              } as Estimate;
              est.push(obj);
            });
          });
          return est;
        })
      ) as Observable<Estimate[]>;
  }
}
