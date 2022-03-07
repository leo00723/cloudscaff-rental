import { Component, Input } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { Term } from 'src/app/models/term.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-terms',
  templateUrl: './add-terms.component.html',
})
export class AddTermsComponent {
  @Input() term: Term = {
    id: '',
    terms: '',
  };
  company: Company;
  user: User;
  loading = false;
  ready = false;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
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
