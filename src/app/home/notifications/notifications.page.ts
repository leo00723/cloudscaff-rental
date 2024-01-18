import { Component, OnInit, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications.page.html',
})
export class NotificationsPage implements OnInit {
  date = new Date();
  notifications = [];
  notifications$: Observable<any>;
  masterSvc = inject(MasterService);

  constructor() {}

  ngOnInit() {
    this.init();
  }

  delete(index) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.notifications.splice(index, 1);
    });
  }

  deleteAll(notifications: any[]) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const id = this.masterSvc.store().selectSnapshot(UserState.user)?.id;
      const batch = this.masterSvc.edit().batch();
      for (const notification of notifications) {
        const doc = this.masterSvc
          .edit()
          .docRef(`users/${id}/notifications`, notification.id);
        batch.delete(doc);
      }
      await batch.commit();
    });
  }

  archive(index) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.notifications.splice(index, 1);
    });
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(UserState.user)?.id;
    setTimeout(() => {
      if (id) {
        this.notifications$ = this.masterSvc
          .edit()
          .getCollection(`users/${id}/notifications`)
          .pipe(
            tap((data) => {
              this.notifications = data;
            })
          );
      } else {
        this.masterSvc.log(
          '-----------------------try notifications----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
