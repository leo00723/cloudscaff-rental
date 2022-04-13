import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Invoice } from 'src/app/models/invoice.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-share-document',
  templateUrl: './share-document.component.html',
  styles: [],
})
export class ShareDocumentComponent {
  @Input() data: { type: string; doc: any };
  form: FormGroup;
  loading = false;
  constructor(private masterSvc: MasterService) {
    this.form = this.masterSvc.fb().group({
      email: ['', [Validators.required, Validators.email]],
      cc: this.masterSvc.fb().array([]),
    });
  }

  get emailForms() {
    return this.form.get('cc') as FormArray;
  }

  addEmail() {
    const email = this.masterSvc.fb().group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.emailForms.push(email);
  }

  deleteEmail(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.emailForms.removeAt(i);
    });
  }

  async send() {
    switch (this.data.type) {
      case 'estimate':
        {
          try {
            this.loading = true;
            const quote: Estimate = this.data.doc.estimate;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewEstimate/${company.id}-${quote.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${quote.customer.name}, ${company.name} has sent you a Estimate.`,
                  message: '',
                  btnText: 'View Estimate',
                  link,
                  subject: `${company.name} Estimate - ${quote.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedEstimates',
                { ...this.data.doc, cc, email },
                `${company.id}-${quote.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Estimate shared successfully', 'success');
            this.close();
            this.loading = false;
          } catch (error) {
            console.error(error);
            this.masterSvc
              .notification()
              .toast('Something went wrong! Please try again', 'danger');
            this.loading = false;
          }
        }
        break;
      case 'invoice': {
        try {
          this.loading = true;
          const invoice: Invoice = this.data.doc.invoice;
          const company: Company = this.data.doc.company;
          const link = `https://app.cloudscaff.com/viewInvoice/${company.id}-${invoice.id}`;
          const email = this.form.value;
          const cc = email.cc.map((e) => e.email);
          const emailData = {
            to: email.email,
            cc: cc.length > 0 ? cc : '',
            template: {
              name: 'share',
              data: {
                title: `Hey ${invoice.customer.name}, ${company.name} has sent you a Invoice.`,
                message: '',
                btnText: 'View Invoice',
                link,
                subject: `${company.name} Invoice - ${invoice.code}`,
              },
            },
          };
          await this.masterSvc
            .edit()
            .setDoc(
              'sharedInvoices',
              { ...this.data.doc, cc, email },
              `${company.id}-${invoice.id}`
            );
          await this.masterSvc
            .edit()
            .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
          this.form.reset();
          this.masterSvc
            .notification()
            .toast('Invoice shared successfully', 'success');
          this.close();
          this.loading = false;
        } catch (error) {
          console.error(error);
          this.masterSvc
            .notification()
            .toast('Something went wrong! Please try again', 'danger');
          this.loading = false;
        }
      }
    }
  }

  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'shareDocument');
  }
}
