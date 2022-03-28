import { Component, Input, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Handover } from 'src/app/models/handover.model';
import { HandoverTemplate } from 'src/app/models/handoverTemplate.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-handover',
  templateUrl: './add-handover.component.html',
})
export class AddHandoverComponent implements OnInit {
  @Input() set value(val: Scaffold) {
    this.scaffold = val;
  }
  scaffold: Scaffold;
  @Select() company$: Observable<Company>;
  customer$: Observable<Customer>;
  template$: Observable<HandoverTemplate>;
  handover: Handover = {
    date: new Date(),
    code: '',
    status: 'pending-Needs Signature',
    safe: '',
    maxLoad: '',
    notes: '',
    detail: '',
    createdBy: '',
  };

  loading = false;
  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company).id;
    this.customer$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${id}/customers`,
        this.scaffold.customerId
      ) as Observable<Customer>;
    this.handover.code = `HAN${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.scaffold.totalHandovers + 1).toString().padStart(6, '0')}`;

    this.template$ = this.masterSvc
      .edit()
      .getDocById(`company/${id}/templates`, 'handover')
      .pipe(
        tap((handover: HandoverTemplate) => {
          this.handover.detail = handover.detail;
        })
      ) as Observable<HandoverTemplate>;
  }

  updateScaffold(ev) {
    this.scaffold.scaffold = ev.scaffold;
    this.scaffold.boards = ev.boards;
  }
  create(customer: Customer) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.handover.createdBy = user.id;
        this.handover.company = company;
        this.handover.customer = customer;
        this.handover.scaffold = this.scaffold;

        await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/handovers`, this.handover);
        await this.masterSvc
          .edit()
          .updateDoc(`company/${company.id}/scaffolds`, this.scaffold.id, {
            totalHandovers: increment(1),
          });
        this.masterSvc
          .notification()
          .toast('Handover created successfully', 'success');
        this.loading = false;
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your Handover, Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'addHandover');
  }
}
