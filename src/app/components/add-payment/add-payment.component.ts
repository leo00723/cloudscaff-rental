import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { increment } from 'firebase/firestore';
import { Company } from 'src/app/models/company.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Payment } from 'src/app/models/payment.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
})
export class AddPaymentComponent {
  @Input() isEdit = false;
  @Input() payment: Payment = {};

  @Input() set value(val: Invoice) {
    Object.assign(this.invoice, val);
    this.init();
  }
  invoice: Invoice = {};
  form: FormGroup;
  company: Company;
  user: User;

  show = '';
  loading = false;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  save() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        const payment: Payment = this.form.value;
        payment.date = new Date(payment.date);
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/payments`, payment);

        this.invoice.totalPaid += payment.total;
        this.invoice.totalOutstanding -= payment.total;
        this.invoice.depositTotal =
          this.invoice.depositTotal === payment.total
            ? 0
            : this.invoice.depositTotal - payment.total;
        this.invoice.deposit = 0;

        if (this.invoice.totalOutstanding === 0) {
          this.invoice.status = 'accepted-Paid';
        } else if (this.invoice.totalOutstanding < 0) {
          this.invoice.status = 'rejected-Over Paid';
        } else {
          this.invoice.status = 'updated-Partial Payment';
        }

        await this.masterSvc
          .edit()
          .updateDoc(`company/${this.company.id}/invoices`, this.invoice.id, {
            ...this.invoice,
          });
        this.masterSvc
          .notification()
          .toast('Payment added successfully!', 'success');
        this.loading = false;
        this.masterSvc.modal().dismiss(undefined, 'close', 'addPayment');
        this.masterSvc.modal().dismiss(undefined, 'close', 'addInvoice');
      } catch (err) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong adding your payment, try again!',
            'danger',
            2000
          );
      }
    });
  }

  close() {
    this.masterSvc.modal().dismiss();
  }

  field(field: string, form) {
    return form.get(field) as FormControl;
  }

  async download() {
    try {
      this.loading = true;
      const pdf = await this.masterSvc
        .pdf()
        .generateInvoice(this.payment.invoice, this.company, null);
      this.masterSvc.pdf().handlePdf(pdf, this.payment.invoiceCode);
      this.loading = false;
    } catch (e) {
      console.error(e);
      this.loading = false;
    }
  }

  private init() {
    this.form = this.masterSvc.fb().group({
      customer: [this.invoice.customer.name, Validators.required],
      customerId: [this.invoice.customer.id, Validators.required],
      date: [undefined, Validators.required],
      email: [this.invoice.customer.email, Validators.required],
      estimateId: [this.invoice.estimateId, Validators.required],
      invoice: [this.invoice, Validators.required],
      invoiceCode: [this.invoice.code, Validators.required],
      scaffoldId: [this.invoice.scaffoldId, Validators.required],
      siteId: [this.invoice.siteId, Validators.required],
      total: [this.invoice.depositTotal, Validators.required],
    });
  }
}
