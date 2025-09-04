import { Component, inject, Input, OnInit } from '@angular/core';
import {
  arrayRemove,
  arrayUnion,
  orderBy,
  serverTimestamp,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import { DateDiffPipe } from 'src/app/components/dateDiff.pipe';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { Job Reference } from 'src/app/models/po.model';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PdfService } from 'src/app/services/pdf.service';
import { POUpdateService } from 'src/app/services/po-update.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styles: [],
})
export class PurchaseOrderComponent implements OnInit {
  @Input() set value(val: Job Reference) {
    if (val) {
      Object.assign(this.po, val);
      this.init();
    }
  }

  protected company: Company;
  protected form: FormGroup;
  protected po: Job Reference = {
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
  protected updatingPONumber = false;

  private editSvc = inject(EditService);
  private fb = inject(FormBuilder);
  private modalSvc = inject(ModalController);
  private notificationSvc = inject(NotificationService);
  private store = inject(Store);
  private dateDiff = inject(DateDiffPipe);
  private pdfSvc = inject(PdfService);
  private alertCtrl = inject(AlertController);
  private poUpdateSvc = inject(POUpdateService);

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
    const date = (await modal.onDidDismiss()).data;

    if (!date) {
      return;
    }

    try {
      this.saving = true;
      const batch = this.editSvc.batch();

      this.transactions.forEach((item) => {
        if (item.deliveryCode === transaction.deliveryCode) {
          const doc = this.editSvc.docRef(
            `company/${this.company.id}/transactionLog`,
            item.id
          );
          item.invoiceStart = Timestamp.fromDate(new Date(date));
          batch.update(doc, { ...item });
        }
      });
      await batch.commit();
      this.calcTotal();
    } catch (e) {
      console.log(e);
      this.notificationSvc.toast(
        'Something went wrong saving date, please try again',
        'danger'
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
      item.siteId = this.po.site.id;

      try {
        this.saving = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/transactionLog`,
          item.id,
          {
            hireRate: item.hireRate,
            siteId: item.siteId,
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

  enableCustomInvoice() {
    this.po.customInvoice = !this.po.customInvoice;
    this.calcTotal();
  }

  enableMixedInvoice() {
    this.po.mixedInvoice = !this.po.mixedInvoice;
    this.calcTotal();
  }

  updatePOEstimate(estimate: EstimateV2) {
    this.po.estimate = estimate;
    this.calcTotal();
  }

  createInvoice() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;
        const invoice: TransactionInvoice = {
          ...this.po,
          ...this.form.value,
          status: 'pending',
          items: this.transactions,
          createdBy: this.user.id,
          createdByName: this.user.name,
          date: new Date(),
          poId: this.po.id,
          creditItems: [],
          creditTotal: 0,
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
  closePO() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;

        await this.editSvc.updateDoc(
          `company/${this.company.id}/pos`,
          this.po.id,
          {
            status: 'completed',
          }
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/sites`,
          this.po.site.id,
          {
            poList: arrayRemove(this.po.jobReference),
          }
        );

        this.notificationSvc.toast('Job Reference closed successfully.', 'success');
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
  openPO() {
    this.notificationSvc.presentAlertConfirm(async () => {
      try {
        this.saving = true;

        await this.editSvc.updateDoc(
          `company/${this.company.id}/pos`,
          this.po.id,
          {
            status: 'pending',
          }
        );

        await this.editSvc.updateDoc(
          `company/${this.company.id}/sites`,
          this.po.site.id,
          {
            poList: arrayUnion(this.po.jobReference),
          }
        );

        this.notificationSvc.toast('Job Reference open successfully.', 'success');
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

  async downloadDraft(isBasic?: boolean) {
    const invoice: TransactionInvoice = {
      ...this.po,
      ...this.form.value,
      status: 'pending',
      items: this.transactions,
      createdBy: this.user.id,
      createdByName: this.user.name,
      date: new Date(),
      poId: this.po.id,
      creditItems: [],
      creditTotal: 0,
    };
    const pdf = isBasic
      ? await this.pdfSvc.rentalInvoiceMerged(invoice, this.company, null, true)
      : await this.pdfSvc.rentalInvoice(invoice, this.company, null, true);
    this.pdfSvc.handlePdf(pdf, this.po.code);
  }
  async downloadMixedDraft() {
    const invoice: TransactionInvoice = {
      ...this.po,
      ...this.form.value,
      status: 'pending',
      items: this.transactions,
      createdBy: this.user.id,
      createdByName: this.user.name,
      date: new Date(),
      poId: this.po.id,
      creditItems: [],
      creditTotal: 0,
    };
    const pdf = await this.pdfSvc.mixedInvoice(
      invoice,
      this.company,
      null,
      true
    );
    this.pdfSvc.handlePdf(pdf, this.po.code);
  }

  async updatePONumber() {
    try {
      // First, get count of affected records
      const updateCounts = await this.poUpdateSvc.getUpdateCount(
        this.company.id,
        this.po.site.id,
        this.po.jobReference
      );

      const alert = await this.alertCtrl.create({
        header: 'Update Job Reference',
        message: `This will update ${updateCounts.total} related records including:
        • ${updateCounts.transactionLogs} transaction logs
        • ${updateCounts.shipments} shipments
        • ${updateCounts.adjustments} adjustments
        • ${updateCounts.returns} returns
        • ${updateCounts.invoices} invoices
        • ${updateCounts.transfers} transfers`,
        inputs: [
          {
            name: 'newPONumber',
            type: 'text',
            placeholder: 'Enter new Job Reference',
            value: this.po.jobReference,
            attributes: {
              minlength: 1,
              required: true,
            },
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Update',
            handler: (data) => {
              if (
                data.newPONumber &&
                data.newPONumber !== this.po.jobReference
              ) {
                this.performPONumberUpdate(data.newPONumber);
              }
            },
          },
        ],
        mode: 'ios',
      });

      await alert.present();
    } catch (error) {
      console.error('Error getting update count:', error);
      this.notificationSvc.toast(
        'Failed to load update information. Please try again.',
        'danger'
      );
    }
  }

  private async performPONumberUpdate(newPONumber: string) {
    this.notificationSvc.presentAlertConfirm(
      async () => {
        try {
          this.updatingPONumber = true;
          await this.poUpdateSvc.updatePONumberAcrossCollections(
            this.company.id,
            this.po.site.id,
            this.po.jobReference,
            newPONumber,
            this.po.id
          );
          this.po.jobReference = newPONumber;
          this.notificationSvc.toast(
            'Job Reference updated successfully!',
            'success'
          );
        } catch (error) {
          console.error('Error updating Job Reference:', error);
          this.notificationSvc.toast(
            error.message ||
              'Failed to update Job Reference. Please try again.',
            'danger'
          );
        } finally {
          this.updatingPONumber = false;
        }
      },
      'This action will update the Job Reference across all related records including ' +
        'transaction logs, shipments, adjustments, and returns. This cannot be undone.',
      'Update Job Reference'
    );
  }

  private calculateTransactionSubtotal() {
    this.transactions.forEach((item) => {
      item.days =
        item.transactionType === 'Return'
          ? +this.dateDiff.transform(
              item.invoiceStart.toDate(),
              item.invoiceEnd.toDate()
            )
          : +this.dateDiff.transform(
              item.invoiceStart.toDate(),
              this.field('endDate').value
            );

      item.months = +(item.days / 30).toFixed(2);
      item.total = +(+item.invoiceQty * +item.hireRate * item.months).toFixed(
        2
      );

      this.po.subtotal += item.total;
    });
  }

  private async calcTotal() {
    this.po.subtotal = 0;

    // Calculate subtotal based on invoice type
    if (this.po.customInvoice) {
      // For both customInvoice cases (with or without mixedInvoice)
      this.po.estimate.items.forEach((item) => {
        if (item.forInvoice) {
          this.po.subtotal += item.total;
        }
      });

      // Add transaction calculations only if mixedInvoice is true
      if (this.po.mixedInvoice) {
        this.calculateTransactionSubtotal();
      }
    } else {
      // Only transaction calculations for non-customInvoice
      this.calculateTransactionSubtotal();
    }

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

    try {
      this.saving = true;
      await this.editSvc.updateDoc(
        `company/${this.company.id}/pos`,
        this.po.id,
        this.po
      );
    } catch (e) {
      console.log(e);
      this.notificationSvc.toast(
        'Something went wrong saving Job Reference, please try again',
        'danger'
      );
    } finally {
      this.saving = false;
    }
  }

  private init() {
    this.po.jobReference;
    this.editSvc
      .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
        where('jobReference', '==', this.po.jobReference),
        where('siteId', '==', this.po.site.id),
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
