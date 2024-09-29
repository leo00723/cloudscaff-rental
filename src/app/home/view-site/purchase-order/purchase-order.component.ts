import { Component, inject, Input, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable, take } from 'rxjs';
import { DateDiffPipe } from 'src/app/components/dateDiff.pipe';
import { Company } from 'src/app/models/company.model';
import { PO } from 'src/app/models/po.model';
import { Site } from 'src/app/models/site.model';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styles: [],
})
export class PurchaseOrderComponent implements OnInit {
  @Input() set value(val: PO) {
    if (val) {
      Object.assign(this.po, val);
      this.init();
    }
  }

  protected company: Company;
  protected form: FormGroup;
  protected po: PO = { subtotal: 0, discount: 0, total: 0, tax: 0, vat: 0 };
  protected saving = false;
  protected transactions: TransactionItem[];
  protected user: User;

  private editSvc = inject(EditService);
  private fb = inject(FormBuilder);
  private modalSvc = inject(ModalController);
  private notificationSvc = inject(NotificationService);
  private store = inject(Store);
  private dateDiff = inject(DateDiffPipe);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.form = this.fb.group({
      excludeVAT: [false, Validators.required],
      endDate: ['', Validators.required],
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

  async updateRate(val, item: TransactionItem) {
    if (isNaN(+val.detail.target.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.hireRate = +val.detail.target.value;
      try {
        this.saving = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/transactionLog`,
          item.id,
          {
            hireRate: item.hireRate,
          }
        );
        this.calcTotal();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong saving rate, please try again',
          'danger'
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

  createInvoice() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;
        const invoice: TransactionInvoice = {
          ...this.po,
          ...this.form,
          status: 'pending',
          items: this.transactions,
        };

        invoice.code = this.editSvc.generateDocCode(
          this.company.totalInvoices,
          'INV'
        );

        await this.editSvc.addDocument(
          `company/${this.company.id}/transactionInvoices`,
          invoice
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/pos`,
          this.po.id,
          {
            lastInvoiceTotal: this.po.total,
          }
        );

        this.notificationSvc.toast('Invoice created successfully.', 'success');
        this.close();
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong. Please try again.',
          'danger'
        );
      } finally {
        this.saving = false;
      }
    });
  }

  private calcTotal() {
    this.po.subtotal = 0;
    this.transactions.forEach((item) => {
      this.po.subtotal +=
        +item.invoiceQty *
        +item.hireRate *
        (item.transactionType === 'Return'
          ? +this.dateDiff.transform(
              item.invoiceStart.toDate(),
              item.returnDate.toDate(),
              true
            )
          : +this.dateDiff.transform(
              item.invoiceStart.toDate(),
              this.field('endDate').value
            ));
    });

    this.po.discount = +this.field('discount').value;
    const totalAfterDiscount = this.po.subtotal - this.po.discount;
    this.po.tax = 0;
    this.po.vat = 0;
    this.po.total = 0;
    if (this.field('excludeVAT').value || this.po.site.customer.excludeVAT) {
      this.po.total = totalAfterDiscount + this.po.tax + this.po.vat;
    } else {
      this.po.tax = totalAfterDiscount * (this.company.salesTax / 100);
      this.po.vat = totalAfterDiscount * (this.company.vat / 100);
      this.po.total = totalAfterDiscount + this.po.tax + this.po.vat;
    }
  }

  private init() {
    this.po.poNumber;
    this.editSvc
      .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
        where('poNumber', '==', this.po.poNumber),
        where('status', '==', 'active'),
        orderBy('transactionType', 'asc'),
        orderBy('invoiceStart', 'asc'),
        orderBy('code', 'asc'),
      ])
      .pipe(take(1))
      .subscribe((data) => {
        this.transactions = data;
        this.calcTotal();
      });
  }
}
