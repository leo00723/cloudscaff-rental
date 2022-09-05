import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Credit } from 'src/app/models/credit.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Modification } from 'src/app/models/modification.model';
import { Statement } from 'src/app/models/statement.mode';
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
                  title: `Hey ${quote.customer.name}, ${company.name} has sent you an Estimate.`,
                  message: '',
                  btnText: 'View Estimate',
                  link,
                  subject: `${company.name} Estimate - ${quote.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .updateDoc('sharedEstimates', `${company.id}-${quote.id}`, {
                ...this.data.doc,
                cc,
                email,
              });
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            if (this.data.doc.estimate.enquiryId.length > 0) {
              await this.masterSvc
                .edit()
                .updateDoc(
                  `company/${company.id}/enquiries`,
                  this.data.doc.estimate.enquiryId,
                  { status: 'sent' }
                );
            }
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
      case 'bulkEstimate':
        {
          try {
            this.loading = true;
            const bulkEstimate: BulkEstimate = this.data.doc.bulkEstimate;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewBulkEstimate/${company.id}-${bulkEstimate.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${bulkEstimate.customer.name}, ${company.name} has sent you a Estimate.`,
                  message: '',
                  btnText: 'View Estimate',
                  link,
                  subject: `${company.name} Estimate - ${bulkEstimate.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .updateDoc(
                'sharedBulkEstimates',
                `${company.id}-${bulkEstimate.id}`,
                { ...this.data.doc, cc, email }
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            if (this.data.doc.bulkEstimate.enquiryId.length > 0) {
              await this.masterSvc
                .edit()
                .updateDoc(
                  `company/${company.id}/enquiries`,
                  this.data.doc.bulkEstimate.enquiryId,
                  { status: 'sent' }
                );
            }
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
      case 'inventoryEstimate':
        {
          try {
            this.loading = true;
            const inventoryEstimate: BulkInventoryEstimate =
              this.data.doc.inventoryEstimate;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewInventoryEstimate/${company.id}-${inventoryEstimate.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${inventoryEstimate.customer.name}, ${company.name} has sent you a Estimate.`,
                  message: '',
                  btnText: 'View Estimate',
                  link,
                  subject: `${company.name} Estimate - ${inventoryEstimate.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedInventoryEstimates',
                { ...this.data.doc, cc, email },
                `${company.id}-${inventoryEstimate.id}`
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
      case 'invoice':
        {
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
                  title: `Hey ${invoice.customer.name}, ${company.name} has sent you an Invoice.`,
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
        break;
      case 'modification':
        {
          try {
            this.loading = true;
            const modification: Modification = this.data.doc.modification;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewModification/${company.id}-${modification.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${modification.customer.name}, ${company.name} has sent you a Modification.`,
                  message: '',
                  btnText: 'View Modification',
                  link,
                  subject: `${company.name} Modification - ${modification.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedModifications',
                { ...this.data.doc, cc, email },
                `${company.id}-${modification.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Modification shared successfully', 'success');
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
      case 'inspection':
        {
          try {
            this.loading = true;
            const inspection: Inspection = this.data.doc.inspection;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewInspection/${company.id}-${inspection.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${inspection.customer.name}, ${company.name} has sent you an Inspection.`,
                  message: '',
                  btnText: 'View Inspection',
                  link,
                  subject: `${company.name} Inspection - ${inspection.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedInspections',
                { ...this.data.doc, cc, email },
                `${company.id}-${inspection.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Inspection shared successfully', 'success');
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
      case 'handover':
        {
          try {
            this.loading = true;
            const handover: Handover = this.data.doc.handover;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewHandover/${company.id}-${handover.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${handover.customer.name}, ${company.name} has sent you a Handover.`,
                  message: '',
                  btnText: 'View Handover',
                  link,
                  subject: `${company.name} Handover - ${handover.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedHandovers',
                { ...this.data.doc, cc, email },
                `${company.id}-${handover.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Handover shared successfully', 'success');
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
      case 'credit':
        {
          try {
            this.loading = true;
            const credit: Credit = this.data.doc.credit;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewCredit/${company.id}-${credit.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${credit.customer.name}, ${company.name} has sent you a Credit Note.`,
                  message: '',
                  btnText: 'View Credit Note',
                  link,
                  subject: `${company.name} Credit Note - ${credit.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedCredits',
                { ...this.data.doc, cc, email },
                `${company.id}-${credit.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Credit Note shared successfully', 'success');
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
      case 'statement':
        {
          try {
            this.loading = true;
            const statement: Statement = this.data.doc.statement;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewStatement/${company.id}-${statement.customer.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${statement.customer.name}, ${company.name} has sent you a Statement.`,
                  message: '',
                  btnText: 'View Statement',
                  link,
                  subject: `${company.name} Statement - ${statement.dates.date}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedStatements',
                { ...this.data.doc, cc, email },
                `${company.id}-${statement.customer.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Statement shared successfully', 'success');
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
    }
  }

  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'shareDocument');
  }
}
