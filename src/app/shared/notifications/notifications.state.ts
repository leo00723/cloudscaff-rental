import { Injectable } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { Notification } from 'src/app/models/notification.model';
import { EditService } from 'src/app/services/edit.service';
import {
  GetNotifications,
  SetNotificationFlag,
  SetNotifications,
} from './notifications.actions';
import { NotificationService } from 'src/app/services/notification.service';

@State<Notification[]>({
  name: 'notifications',
  defaults: null,
})
@Injectable()
export class NotificationsState {
  private audio: HTMLAudioElement;

  constructor(
    private editSvc: EditService,
    private store: Store,
    private notificationSvc: NotificationService
  ) {}

  @Action(SetNotifications)
  setNotifications(
    { setState }: StateContext<Notification[]>,
    { payload }: SetNotifications
  ) {
    setState(payload);
  }

  @Action(GetNotifications, { cancelUncompleted: true })
  getNotifications(
    { dispatch }: StateContext<string>,
    { payload }: GetNotifications
  ) {
    return this.editSvc
      .getCollectionFiltered(`users/${payload}/notifications`, [
        orderBy('date', 'desc'),
      ])
      .pipe(
        tap(async (notifications: Notification[]) => {
          dispatch(new SetNotifications(notifications));
          let counter = 0;
          for (const notification of notifications) {
            if (!notification.read) {
              counter++;
            }
          }
          if (counter > 0) {
            this.store.dispatch(new SetNotificationFlag(counter));
            this.audio = new Audio();
            this.audio.src = 'assets/notification.wav';
            setTimeout(() => {
              this.audio.play();
            }, 2000);
            counter = 0;
            this.notificationSvc.showNotification(
              'Cloudscaff Notification Recieved',
              {
                body: 'Please check your Cloudscaff notifications.',
              }
            );
          } else {
            this.store.dispatch(new SetNotificationFlag(null));
          }
        }),
        catchError((error) => dispatch(new SetNotifications(null)))
      );
  }

  @Selector()
  static notifications(state: Notification[]) {
    return state;
  }
}
