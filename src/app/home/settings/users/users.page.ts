import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
})
export class UsersPage implements OnInit {
  users$: Observable<User[]>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async editUser(user: User) {
    const modal = await this.masterSvc.modal().create({
      component: AddUserComponent,
      componentProps: {
        value: user,
        title: 'Edit User',
        isEdit: true,
        isCreate: false,
      },
      cssClass: 'accept',
      showBackdrop: true,
      id: 'editUser',
    });
    return await modal.present();
  }

  async addUser() {
    const modal = await this.masterSvc.modal().create({
      component: AddUserComponent,
      cssClass: 'accept',
      showBackdrop: true,
      id: 'editUser',
    });
    return await modal.present();
  }

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.users$ = this.masterSvc
          .edit()
          .getCollectionWhere('users', 'company', '==', id) as Observable<
          User[]
        >;
      } else {
        this.masterSvc.log(
          '-----------------------try users----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
