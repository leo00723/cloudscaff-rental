import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { Company } from 'src/app/models/company.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-add-terms',
  templateUrl: './add-terms.component.html',
})
export class AddTermsComponent {
  @Input() company: Company;
  @Input() user: any;
  @Input() term: Term = {
    id: '',
    terms: '',
  };
  loading = false;
  ready = false;
  constructor(private masterSvc: MasterService) {}
  ionViewDidEnter() {
    this.ready = true;
  }

  close() {
    this.masterSvc.modal().dismiss();
  }

  update() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.masterSvc
        .edit()
        .setDoc(`company/${this.company.id}/terms`, this.term, this.term.id)
        .then(() => {
          this.masterSvc
            .notification()
            .toast('Terms updated successfully', 'success')
            .then(() => {
              this.close();
              this.loading = false;
            });
        })
        .catch((error) => {
          console.error(error);
          this.masterSvc
            .notification()
            .toast('Something went wrong! Try again later.', 'danger')
            .then(() => {
              this.loading = false;
            });
        });
    });
  }
}
