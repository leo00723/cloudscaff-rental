import { Component, inject, Input, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DateDiffPipe } from 'src/app/components/dateDiff.pipe';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { Term } from 'src/app/models/term.model';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PdfService } from 'src/app/services/pdf.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
})
export class InvoiceComponent implements OnInit {
  @Input() set value(val: TransactionInvoice) {
    if (val) {
      Object.assign(this.invoice, val);
    }
  }
  terms$: Observable<Term>;

  protected company: Company;
  protected form: FormGroup;
  protected invoice: TransactionInvoice = { creditTotal: 0, creditItems: [] };
  protected saving = false;
  protected allowEdit = false;
  protected user: User;

  private editSvc = inject(EditService);
  private pdfSvc = inject(PdfService);

  private modalSvc = inject(ModalController);
  private notificationSvc = inject(NotificationService);
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private dateDiff = inject(DateDiffPipe);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.terms$ = this.editSvc.getDocById(
      `company/${this.company.id}/terms`,
      'Invoice',
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      creditItems: this.fb.array([]),
    });
    this.invoice?.creditItems?.forEach((a) => {
      const item = this.fb.group({
        description: [a.description || '', Validators.required],
        total: [a.total || 0, Validators.required],
      });
      this.creditForms.push(item);
    });
    this.invoice.items.sort((a, b) => {
      // Compare by code first
      if (a.code !== b.code) {
        return a.code.localeCompare(b.code);
      }

      // If codes are equal, compare by transactionType
      return a.transactionType.localeCompare(b.transactionType);
    });

    this.calcTotal();
  }

  async markAsSent() {
    this.notificationSvc.presentAlertConfirm(async () => {
      this.invoice.status = 'sent';
      try {
        await this.editSvc.updateDoc(
          `company/${this.company.id}/transactionInvoices`,
          this.invoice.id,
          { status: 'sent' },
        );
        this.notificationSvc.toast('Invoice marked as sent', 'success');
        this.close();
      } catch (error) {
        console.log(error);
        this.notificationSvc.toast(
          'something went wrong saving the invoice, Please check internet connection.',
          'danger',
        );
      }
    });
  }

  updateJobReferenceEstimate(estimate: EstimateV2) {
    this.invoice.estimate = estimate;
    this.calcTotal();
  }

  enableCustomInvoice() {
    this.invoice.customInvoice = !this.invoice.customInvoice;
    this.calcTotal();
  }

  enableMixedInvoice() {
    this.invoice.mixedInvoice = !this.invoice.mixedInvoice;
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

  async downloadDetailed(terms: Term = null, isDraft = true) {
    const pdf = await this.pdfSvc.mixedInvoice(
      this.invoice,
      this.company,
      terms,
      isDraft,
    );
    this.pdfSvc.handlePdf(
      pdf,
      `${this.company.name}-${this.invoice.site.code}-${this.invoice.code}`,
    );
  }

  async downloadBasic(terms: Term = null, isDraft = true) {
    const pdf = await this.pdfSvc.rentalInvoice(
      this.invoice,
      this.company,
      terms,
      isDraft,
    );
    await this.pdfSvc.handlePdf(
      pdf,
      `${this.company.name}-${this.invoice.site.code}-${this.invoice.code}`,
    );
  }

  close() {
    this.modalSvc.dismiss();
  }

  // START: FORM CRUD

  get creditForms() {
    return this.form.get('creditItems') as FormArray;
  }

  addItem() {
    const item = this.fb.group({
      description: ['', Validators.required],
      total: [0, Validators.required],
    });
    this.creditForms.push(item);
  }

  deleteItem(i: number) {
    this.notificationSvc.presentAlertConfirm(() => {
      this.creditForms.removeAt(i);
      this.calcTotal();
    });
  }

  // END: FORM CRUD

  async updateRate(val, item: TransactionItem, field: string) {
    const value = +val.detail.target.value;
    if (isNaN(value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item[field] = value;
      this.calcTotal();
    }
  }

  async updateDate(transaction: TransactionItem, isStart = true) {
    if (!this.allowEdit) {
      return;
    }
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
    const date = (await modal.onDidDismiss()).data;

    if (!date) {
      return;
    }

    this.invoice.items.forEach((item) => {
      if (item.deliveryCode === transaction.deliveryCode) {
        isStart
          ? (item.invoiceStart = Timestamp.fromDate(new Date(date)))
          : (item.invoiceEnd = Timestamp.fromDate(new Date(date)));
      }
    });
    this.calcTotal();
  }

  protected async calcTotal() {
    this.saving = true;
    this.invoice.subtotal = 0;

    // Calculate subtotal based on invoice type
    if (this.invoice.customInvoice) {
      // For both customInvoice cases (with or without mixedInvoice)
      this.invoice.estimate.items.forEach((item) => {
        if (item.forInvoice) {
          this.invoice.subtotal += item.total;
        }
      });

      // Add transaction calculations only if mixedInvoice is true
      if (this.invoice.mixedInvoice) {
        this.calculateTransactionSubtotal();
      }
    } else {
      // Only transaction calculations for non-customInvoice
      this.calculateTransactionSubtotal();
    }

    const totalAfterDiscount = this.invoice.subtotal - this.invoice.discount;
    this.invoice.tax = 0;
    this.invoice.vat = 0;
    this.invoice.total = 0;
    if (this.invoice.excludeVAT || this.invoice.site.customer.excludeVAT) {
      this.invoice.total = totalAfterDiscount;
    } else {
      this.invoice.tax = totalAfterDiscount * (this.company.salesTax / 100);
      this.invoice.vat = totalAfterDiscount * (this.company.vat / 100);
      this.invoice.total =
        totalAfterDiscount + this.invoice.tax + this.invoice.vat;
    }

    try {
      await this.editSvc.updateDoc(
        `company/${this.company.id}/transactionInvoices`,
        this.invoice.id,
        this.invoice,
      );
    } catch (error) {
      console.log(error);
      this.notificationSvc.toast(
        'something went wrong saving the invoice, Please check internet connection.',
        'danger',
      );
    } finally {
      this.saving = false;
    }
  }

  // Helper function to avoid duplicate code
  private calculateTransactionSubtotal() {
    this.invoice.items.forEach((item) => {
      // Handle damage charges as one-time costs
      if (item.isDamageCharge) {
        item.days = 0;
        item.months = 0;
        item.total = +(
          +item.invoiceQty * +(item.sellingCost || item.hireRate || 0)
        ).toFixed(2);
        this.invoice.subtotal += item.total;
        return;
      }

      // Handle consumables as one-time costs using sellingCost
      if (item.isConsumable) {
        item.days = 0;
        item.months = 0;
        item.total = +(+item.invoiceQty * +item.sellingCost).toFixed(2);
        this.invoice.subtotal += item.total;
        return;
      }

      item.days = +this.dateDiff.transform(
        item.invoiceStart.toDate(),
        item.invoiceEnd.toDate(),
      );

      item.months = +(item.days / 30).toFixed(2);
      item.total = +(+item.invoiceQty * +item.hireRate * item.days).toFixed(2);

      this.invoice.subtotal += item.total;
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

  protected async creditTotalFunction() {
    try {
      this.saving = true;
      this.invoice.subtotal = 0;
      if (!this.invoice.customInvoice) {
        this.invoice.items.forEach((item) => {
          // Handle damage charges as one-time costs
          if (item.isDamageCharge) {
            this.invoice.subtotal +=
              +item.invoiceQty * +(item.sellingCost || item.hireRate || 0);
            return;
          }

          // Handle consumables as one-time costs using sellingCost
          if (item.isConsumable) {
            this.invoice.subtotal += +item.invoiceQty * +item.sellingCost;
            return;
          }

          this.invoice.subtotal +=
            +item.invoiceQty *
            +item.hireRate *
            (item.transactionType === 'Return'
              ? +this.dateDiff.transform(
                  item.invoiceStart.toDate(),
                  item.invoiceEnd.toDate(),
                )
              : +this.dateDiff.transform(
                  item.invoiceStart.toDate(),
                  this.invoice.endDate,
                ));
        });
      } else {
        this.invoice.estimate.items.forEach((item) => {
          if (item.forInvoice) {
            this.invoice.subtotal += item.total;
          }
        });
      }
      this.invoice.creditTotal = 0;
      this.invoice.creditItems = this.form.value.creditItems;
      this.invoice.creditItems.forEach((item) => {
        this.invoice.creditTotal += +item.total;
      });
      const totalAfterDiscount =
        this.invoice.subtotal -
        this.invoice.discount -
        this.invoice.creditTotal;
      this.invoice.tax = 0;
      this.invoice.vat = 0;
      this.invoice.total = 0;
      if (this.invoice.excludeVAT || this.invoice.site.customer.excludeVAT) {
        this.invoice.total =
          totalAfterDiscount + this.invoice.tax + this.invoice.vat;
      } else {
        this.invoice.tax = totalAfterDiscount * (this.company.salesTax / 100);
        this.invoice.vat = totalAfterDiscount * (this.company.vat / 100);
        this.invoice.total =
          totalAfterDiscount + this.invoice.tax + this.invoice.vat;
      }
      await this.editSvc.updateDoc(
        `company/${this.company.id}/transactionInvoices`,
        this.invoice.id,
        this.invoice,
      );
    } catch (error) {
      console.log(error);
      this.notificationSvc.toast(
        'something went wrong saving the invoice, Please check internet connection.',
        'danger',
      );
    } finally {
      this.saving = false;
    }
  }
}
