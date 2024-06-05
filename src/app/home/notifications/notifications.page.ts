import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Notification } from 'src/app/models/notification.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { NotificationsState } from 'src/app/shared/notifications/notifications.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications.page.html',
})
export class NotificationsPage implements OnInit {
  @Select() notifications$: Observable<Notification[]>;

  date = new Date();
  masterSvc = inject(MasterService);

  constructor() {}

  ngOnInit() {
    // this.init();
  }

  async ionViewWillLeave(): Promise<void> {
    const id = this.masterSvc.store().selectSnapshot(UserState.user)?.id;
    const notifications = this.masterSvc
      .store()
      .selectSnapshot(NotificationsState.notifications);
    const batch = this.masterSvc.edit().batch();
    for (const notification of notifications) {
      const doc = this.masterSvc
        .edit()
        .docRef(`users/${id}/notifications`, notification.id);
      batch.update(doc, { read: true });
    }
    await batch.commit();
  }

  // delete(index) {
  //   this.masterSvc.notification().presentAlertConfirm(() => {
  //     this.notifications.splice(index, 1);
  //   });
  // }

  deleteAll() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const id = this.masterSvc.store().selectSnapshot(UserState.user)?.id;
      const notifications = this.masterSvc
        .store()
        .selectSnapshot(NotificationsState.notifications);
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

  // archive(index) {
  //   this.masterSvc.notification().presentAlertConfirm(() => {
  //     this.notifications.splice(index, 1);
  //   });
  // }
}
