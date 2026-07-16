import { Component, inject, Input, OnInit } from '@angular/core';
import {
  arrayRemove,
  arrayUnion,
  orderBy,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import { DateDiffPipe } from 'src/app/components/dateDiff.pipe';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { JobReference } from 'src/app/models/jr.model';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PdfService } from 'src/app/services/pdf.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { JobReferenceFormComponent } from '../job-reference-form/job-reference-form.component';

@Component({
  selector: 'app-job-reference',
  templateUrl: './job-reference.component.html',
  styles: [],
})
export class JobReferenceComponent implements OnInit {
  @Input() set value(val: JobReference) {
    if (val) {
      Object.assign(this.jr, val);
      this.init();
    }
  }

  protected company: Company;
  protected form: FormGroup;
  protected jr: JobReference = {
    subtotal: 0,
    discount: 0,
    total: 0,
    tax: 0,
    vat: 0,
    customInvoice: false,
    mixedInvoice: false,
  };
  protected saving = false;
  protected transactions: TransactionItem[] = [];
  protected user: User;
  protected updatingJobReference = false;

  private editSvc = inject(EditService);
  private fb = inject(FormBuilder);
  private modalSvc = inject(ModalController);
  private notificationSvc = inject(NotificationService);
  private store = inject(Store);
  private dateDiff = inject(DateDiffPipe);
  private pdfSvc = inject(PdfService);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.form = this.fb.group({
      excludeVAT: [false, Validators.required],
      endDate: [undefined, Validators.required],
      discount: [0],
      days: [0],
      months: [0],
    });
  }

  ngOnInit(): void {}

  close() {
    this.modalSvc.dismiss();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  updateDate() {
    // this.field('endDate').value;
    this.calcTotal();
  }

  async updateStartDate(transaction: TransactionItem) {
    const modal = await this.modalSvc.create({
      component: DatepickerComponent,
      id: transaction.deliveryCode,
      cssClass: 'date',
      componentProps: {
        value: undefined,
        field: transaction.deliveryCode,
      },
      backdropDismiss: false,
      mode: 'ios',
    });
    await modal.present();
    const rawStartDate = (await modal.onDidDismiss()).data;
    if (!rawStartDate) {
      return;
    }
    const startDate = this.parseDdMmYyyyDate(rawStartDate);

    try {
      this.saving = true;
      const batch = this.editSvc.batch();

      this.transactions.forEach((item) => {
        if (item.deliveryCode === transaction.deliveryCode) {
          const doc = this.editSvc.docRef(
            `company/${this.company.id}/transactionLog`,
            item.id,
          );
          item.invoiceStart = Timestamp.fromDate(startDate);
          batch.update(doc, { ...item });
        }
      });
      await batch.commit();
      this.calcTotal();
    } catch (e) {
      console.log(e);
      this.notificationSvc.toast(
        'Something went wrong saving date, please try again',
        'danger',
      );
    } finally {
      this.saving = false;
    }
  }

  async updateRate(val, item: TransactionItem) {
    if (isNaN(+val.detail.target.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.hireRate = +val.detail.target.value;
      item.siteId = this.jr.site.id;

      try {
        this.saving = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/transactionLog`,
          item.id,
          {
            hireRate: item.hireRate,
            siteId: item.siteId,
          },
        );
        this.calcTotal();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong saving rate, please try again',
          'danger',
        );
      } finally {
        this.saving = false;
      }
    }
  }

  excludeVAT(args) {
    this.field('excludeVAT').setValue(args.detail.checked);
    this.calcTotal();
  }

  enableCustomInvoice() {
    this.jr.customInvoice = !this.jr.customInvoice;
    this.calcTotal();
  }

  enableMixedInvoice() {
    this.jr.mixedInvoice = !this.jr.mixedInvoice;
    this.calcTotal();
  }

  updateJobReferenceEstimate(estimate: EstimateV2) {
    this.jr.estimate = estimate;
    this.calcTotal();
  }

  protected billingLabel(item: TransactionItem) {
    if (item.minHireApplied) {
      return 'Advance - Min hire applied';
    }

    if (item.isConsumable || item.isDamageCharge) {
      return null;
    }

    if (item.billingMode === 'advance') {
      return 'Advance';
    }

    if (item.billingMode === 'prorate') {
      return 'Prorate';
    }

    return null;
  }

  createInvoice() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;
        const invoiceDate = new Date();
        const invoice: TransactionInvoice = {
          ...this.jr,
          ...this.form.value,
          status: 'pending',
          items: this.transactions,
          createdBy: this.user.id,
          createdByName: this.user.name,
          date: invoiceDate,
          poId: this.jr.id,
          creditItems: [],
          creditTotal: 0,
        };

        invoice.code = this.editSvc.generateDocCode(
          this.company.totalInvoices,
          'INV',
        );

        await this.editSvc.addDocument(
          `company/${this.company.id}/transactionInvoices`,
          invoice,
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/jobReferences`,
          this.jr.id,
          {
            lastInvoiceDate: invoiceDate,
            lastInvoiceTotal: this.jr.total,
          },
        );

        this.notificationSvc.toast('Invoice created successfully.', 'success');
        this.close();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong. Please try again.',
          'danger',
        );
      } finally {
        this.saving = false;
      }
    });
  }
  closeJobReference() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;

        await this.editSvc.updateDoc(
          `company/${this.company.id}/jobReferences`,
          this.jr.id,
          {
            status: 'completed',
          },
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/sites`,
          this.jr.site.id,
          {
            jobReferenceList: arrayRemove(this.jr.jobReference),
          },
        );

        this.notificationSvc.toast(
          'Job Reference closed successfully.',
          'success',
        );
        this.close();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong. Please try again.',
          'danger',
        );
      } finally {
        this.saving = false;
      }
    });
  }
  openJobReference() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;

        await this.editSvc.updateDoc(
          `company/${this.company.id}/jobReferences`,
          this.jr.id,
          {
            status: 'pending',
          },
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/sites`,
          this.jr.site.id,
          {
            jobReferenceList: arrayUnion(this.jr.jobReference),
          },
        );

        this.notificationSvc.toast(
          'Job Reference open successfully.',
          'success',
        );
        this.close();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong. Please try again.',
          'danger',
        );
      } finally {
        this.saving = false;
      }
    });
  }

  async openSettings() {
    const modal = await this.modalSvc.create({
      component: JobReferenceFormComponent,
      componentProps: {
        data: {
          jobReference: this.jr,
          site: this.jr.site,
          isEdit: true,
        },
      },
      id: 'jobReferenceForm',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async downloadDraft(isBasic?: boolean) {
    const invoice: TransactionInvoice = {
      ...this.jr,
      ...this.form.value,
      status: 'pending',
      items: this.transactions,
      createdBy: this.user.id,
      createdByName: this.user.name,
      date: new Date(),
      poId: this.jr.id,
      creditItems: [],
      creditTotal: 0,
    };
    const pdf = await this.pdfSvc.rentalInvoice(
      invoice,
      this.company,
      null,
      true,
    );
    this.pdfSvc.handlePdf(pdf, this.jr.code);
  }
  async downloadMixedDraft() {
    const invoice: TransactionInvoice = {
      ...this.jr,
      ...this.form.value,
      status: 'pending',
      items: this.transactions,
      createdBy: this.user.id,
      createdByName: this.user.name,
      date: new Date(),
      poId: this.jr.id,
      creditItems: [],
      creditTotal: 0,
    };
    const pdf = await this.pdfSvc.mixedInvoice(
      invoice,
      this.company,
      null,
      true,
    );
    this.pdfSvc.handlePdf(pdf, this.jr.code);
  }

  private calculateTransactionSubtotal() {
    const rawBilling = this.field('endDate').value;
    const billingDate = this.parseDdMmYyyyDate(rawBilling);

    this.transactions.forEach((item) => {
      // Handle damage charges as one-time costs
      if (item.isDamageCharge) {
        item.days = 0;
        item.months = 0;
        item.total = +(
          +item.invoiceQty * +(item.sellingCost || item.hireRate || 0)
        ).toFixed(2);
        this.jr.subtotal += item.total;
        return;
      }

      // Handle consumables as one-time costs using sellingCost
      if (item.isConsumable) {
        item.days = 0;
        item.months = 0;
        item.total = +(+item.invoiceQty * +item.sellingCost).toFixed(2);
        this.jr.subtotal += item.total;
        return;
      }

      const start = item.invoiceStart?.toDate
        ? item.invoiceStart.toDate()
        : new Date(item.invoiceStart);

      let end = item.invoiceEnd?.toDate
        ? item.invoiceEnd.toDate()
        : item.invoiceEnd
          ? new Date(item.invoiceEnd)
          : null;

      const canUseBillingDateAsEnd = item.transactionType === 'Delivery';

      // If Firestore cleared invoiceEnd after an invoice, fall back to billing date.
      if (!end && billingDate && canUseBillingDateAsEnd) {
        end = billingDate;
        item.invoiceEnd = Timestamp.fromDate(billingDate);
      }

      if (billingDate && end && end < billingDate && canUseBillingDateAsEnd) {
        end = billingDate;
        item.invoiceEnd = Timestamp.fromDate(billingDate);
      }

      item.days = +this.dateDiff.transform(start, end ?? start);
      item.months = +(item.days / 30).toFixed(2);
      item.total = +(+item.invoiceQty * +item.hireRate * item.days).toFixed(2);
      this.jr.subtotal += item.total;
    });
  }

  private parseDdMmYyyyDate(value: unknown): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const [dayStr, monthStr, yearStr] = value.split('-');
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);

      if (
        Number.isNaN(day) ||
        Number.isNaN(month) ||
        Number.isNaN(year) ||
        day <= 0 ||
        month <= 0 ||
        month > 12
      ) {
        return undefined;
      }

      return new Date(Date.UTC(year, month - 1, day));
    }

    return undefined;
  }

  private async calcTotal() {
    this.jr.subtotal = 0;

    // Calculate subtotal based on invoice type
    if (this.jr.customInvoice) {
      // For both customInvoice cases (with or without mixedInvoice)
      this.jr.estimate.items.forEach((item) => {
        if (item.forInvoice) {
          this.jr.subtotal += item.total;
        }
      });

      // Add transaction calculations only if mixedInvoice is true
      if (this.jr.mixedInvoice) {
        this.calculateTransactionSubtotal();
      }
    } else {
      // Only transaction calculations for non-customInvoice
      this.calculateTransactionSubtotal();
    }
    this.field('discount').setValue(
      +(this.jr.subtotal * (this.jr.discountPercentage / 100)).toFixed(2),
    );
    this.jr.discount = +this.field('discount').value;
    const totalAfterDiscount = this.jr.subtotal - this.jr.discount;
    this.jr.tax = 0;
    this.jr.vat = 0;
    this.jr.total = 0;
    if (this.field('excludeVAT').value || this.jr.site.customer.excludeVAT) {
      this.jr.total = totalAfterDiscount + this.jr.tax + this.jr.vat;
    } else {
      this.jr.tax = totalAfterDiscount * (this.company.salesTax / 100);
      this.jr.vat = totalAfterDiscount * (this.company.vat / 100);
      this.jr.total = totalAfterDiscount + this.jr.tax + this.jr.vat;
    }

    try {
      this.saving = true;
      await this.editSvc.updateDoc(
        `company/${this.company.id}/jobReferences`,
        this.jr.id,
        this.jr,
      );
    } catch (e) {
      console.log(e);
      this.notificationSvc.toast(
        'Something went wrong saving Job Reference, please try again',
        'danger',
      );
    } finally {
      this.saving = false;
    }
  }

  private init() {
    this.jr.jobReference;
    this.editSvc
      .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
        where('jobReference', '==', this.jr.jobReference),
        where('siteId', '==', this.jr.site.id),
        where('status', '==', 'active'),
        orderBy('code', 'asc'),
        orderBy('transactionType', 'asc'),
        orderBy('invoiceStart', 'asc'),
      ])
      .pipe(take(1))
      .subscribe((data) => {
        if (data) {
          this.transactions = data;
          this.calcTotal();
        }
      });
  }
}
