import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { LabourBroker } from 'src/app/models/labour-broker.model';
import { Labour } from 'src/app/models/labour.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
})
export class BrokerComponent implements OnInit {
  @Input() labour: LabourBroker = {};
  @Input() isEdit = false;
  @Input() isDelete = false;
  @Input() isCreate = true;
  @Input() company: Company;
  @Output() completed = new EventEmitter<boolean>();
  loading = false;
  user: User;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
  }

  ngOnInit(): void {
    if (!this.isEdit) {
      this.labour.types = [];
      this.labour.types.push(new Labour('Fixers'));
      this.labour.types.push(new Labour('Labourers'));
      this.labour.types.push(new Labour('Supervisors'));
    }
  }

  createLabour() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.masterSvc
        .edit()
        .addDocument(
          `company/${this.company.id}/brokers`,
          JSON.parse(JSON.stringify(this.labour))
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Rate has been created.', 'success');
          this.completed.emit(true);
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your rate, try again!',
              'danger',
              2000
            );
        });
    });
  }

  updateLabour() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/brokers`,
          this.labour.id,
          JSON.parse(JSON.stringify(this.labour))
        )
        .then(() => {
          this.masterSvc
            .notification()
            .toast('Rate has been updated.', 'success');
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your rate, try again!',
              'danger',
              2000
            );
        });
    });
  }

  removeLabour() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.masterSvc
        .edit()
        .deleteDocById(`company/${this.company.id}/brokers`, this.labour.id)
        .then(() => {
          this.loading = false;
          this.isEdit = false;
          this.masterSvc
            .notification()
            .toast('Rate has been deleted.', 'success');
          this.completed.emit(true);
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your rate, try again!',
              'danger',
              2000
            );
        });
    });
  }
  calcRates(i: number, args) {
    this.labour.types[i].nt = args;
    this.labour.types[i].ot1 = args * 1.5;
    this.labour.types[i].ot2 = args * 2;
    this.labour.types[i].ph = args * 2;
  }

  delete(i) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.labour.types.splice(i, 1);
    });
  }

  add() {
    this.labour.types.push(new Labour(''));
  }
}
