import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
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
      case 'dismantle':
        {
          try {
            this.loading = true;
            const dismantle: Handover = this.data.doc.dismantle;
            const company: Company = this.data.doc.company;
            const link = `https://app.cloudscaff.com/viewDismantle/${company.id}-${dismantle.id}`;
            const email = this.form.value;
            const cc = email.cc.map((e) => e.email);
            const emailData = {
              to: email.email,
              cc: cc.length > 0 ? cc : '',
              template: {
                name: 'share',
                data: {
                  title: `Hey ${dismantle.customer.name}, ${company.name} has sent you a Dismantle.`,
                  message: '',
                  btnText: 'View Dismantle',
                  link,
                  subject: `${company.name} Dismantle - ${dismantle.code}`,
                },
              },
            };
            await this.masterSvc
              .edit()
              .setDoc(
                'sharedDismantles',
                { ...this.data.doc, cc, email },
                `${company.id}-${dismantle.id}`
              );
            await this.masterSvc
              .edit()
              .addDocument('mail', JSON.parse(JSON.stringify(emailData)));
            this.form.reset();
            this.masterSvc
              .notification()
              .toast('Dismantle shared successfully', 'success');
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
