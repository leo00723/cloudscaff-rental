import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DateDiffPipe } from 'src/app/components/dateDiff.pipe';
import { Company } from 'src/app/models/company.model';
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
  protected user: User;

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
    this.terms$ = this.editSvc.getDocById(
      `company/${this.company.id}/terms`,
      'Invoice'
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
  }

  async download(terms: Term | null) {
    const pdf = await this.pdfSvc.generateRentalInvoice(
      this.invoice,
      this.company,
      terms
    );
    this.pdfSvc.handlePdf(pdf, this.invoice.code);
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

  async updateRate(val, item: TransactionItem) {
    // if (isNaN(+val.detail.target.value)) {
    //   return (item.error = true);
    // } else {
    //   item.error = false;
    //   item.hireRate = +val.detail.target.value;
    //   try {
    //     this.saving = true;
    //     await this.editSvc.updateDoc(
    //       `company/${this.company.id}/transactionLog`,
    //       item.id,
    //       {
    //         hireRate: item.hireRate,
    //       }
    //     );
    //     this.calcTotal();
    //   } catch (e) {
    //     console.log(e);
    //     this.notificationSvc.toast(
    //       'Something went wrong saving rate, please try again',
    //       'danger'
    //     );
    //   } finally {
    //     this.saving = false;
    //   }
    // }
  }

  protected async calcTotal() {
    try {
      this.saving = true;
      this.invoice.subtotal = 0;
      this.invoice.items.forEach((item) => {
        this.invoice.subtotal +=
          +item.invoiceQty *
          +item.hireRate *
          (item.transactionType === 'Return'
            ? +this.dateDiff.transform(
                item.invoiceStart.toDate(),
                item.invoiceEnd.toDate(),
                true
              )
            : +this.dateDiff.transform(
                item.invoiceStart.toDate(),
                this.invoice.endDate
              ));
      });
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
        this.invoice
      );
    } catch (error) {
      console.log(error);
      this.notificationSvc.toast(
        'something went wrong saving the invoice, Please check internet connection.',
        'danger'
      );
    } finally {
      this.saving = false;
    }
  }
}
