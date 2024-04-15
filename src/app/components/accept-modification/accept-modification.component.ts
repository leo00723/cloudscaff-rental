import { Component, Input } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Company } from 'src/app/models/company.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Modification } from 'src/app/models/modification.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-accept-modification',
  templateUrl: './accept-modification.component.html',
})
export class AcceptModificationComponent {
  @Input() form;
  @Input() modification: Modification;
  company: Company;
  user: User;
  page = 0;

  show = '';
  loading = false;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  activate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.modification.poNumber = this.form.get('poNumber').value;
        this.modification.woNumber = this.form.get('woNumber').value;
        this.modification.acceptedBy = this.user.name;
        this.modification.status = 'accepted';

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/scaffolds`,
            this.modification.scaffoldId,
            {
              scaffold: this.modification.scaffold,
              attachments: this.modification.attachments,
              boards: this.modification.boards,
              labour: this.modification.labour,
              additionals: this.modification.additionals,
              hire: this.modification.hire,
              totalModifications: increment(1),
              startDate: this.modification.startDate,
              endDate: this.modification.endDate,
              poNumber: this.modification.poNumber,
              woNumber: this.modification.woNumber,
              status: 'pending-Work In Progress',
            }
          );
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        const invoice: Invoice = {};
        const code = this.masterSvc
          .edit()
          .generateDocCode(company.totalInvoices, 'INV');
        Object.assign(invoice, {
          ...this.modification,
          code,
          id: '',
          estimateCode: this.modification.code,
          estimateId: this.modification.id,
          date: new Date(),
          status: 'pending-Not Sent',
          totalOutstanding: this.modification.total,
          totalPaid: 0,
          deposit: 0,
          depositType: 'Percent',
          depositTotal: 'Percent',
        });

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/invoices`, invoice);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalInvoices: increment(1),
        });
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/modifications`,
            this.modification.id,
            this.modification
          );
        this.masterSvc
          .notification()
          .toast('Modification accepted successfully!', 'success');
        this.loading = false;
        this.masterSvc
          .modal()
          .dismiss(undefined, 'close', 'acceptModification');
        this.masterSvc.modal().dismiss(undefined, 'close', 'editModification');
      } catch (err) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong accepting your modification, try again!',
            'danger',
            2000
          );
      }
    });
  }

  close() {
    if (this.page === 0) {
      this.masterSvc.modal().dismiss(undefined, 'close', 'acceptModification');
    }
    this.page--;
  }

  field(field: string, form) {
    return form.get(field) as FormControl;
  }
}
