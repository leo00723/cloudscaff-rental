import { Component, Input, OnInit } from '@angular/core';
import { LabourBroker } from 'src/app/models/labour-broker.model';
import { Labour } from 'src/app/models/labour.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
})
export class BrokerComponent implements OnInit {
  @Input() labour = new LabourBroker();
  @Input() isUpdate = false;
  @Input() companyId: string;
  loading = false;

  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    if (!this.isUpdate) {
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
          `company/${this.companyId}/brokers`,
          JSON.parse(JSON.stringify(this.labour))
        )
        .then(() => {
          this.loading = false;
          this.masterSvc.notification().successToast('Rate has been created.');
          this.ngOnInit();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong creating your rate, try again!',
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
          `company/${this.companyId}/brokers`,
          this.labour.id,
          this.labour
        )
        .then(() => {
          this.masterSvc.notification().successToast('Rate has been updated.');
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong creating your rate, try again!',
              2000
            );
        });
    });
  }

  removeLabour() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.masterSvc
        .edit()
        .deleteDocById(`company/${this.companyId}/brokers`, this.labour.id)
        .then(() => {
          this.loading = false;
          this.isUpdate = false;
          this.masterSvc.notification().successToast('Rate has been deleted.');
          this.labour = new LabourBroker();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong creating your rate, try again!',
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
