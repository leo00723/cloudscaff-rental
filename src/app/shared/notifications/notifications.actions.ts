import { Notification } from 'src/app/models/notification.model';

export class SetNotifications {
  static readonly type = '[notifications] set notifications';
  constructor(public payload: Notification[]) {}
}

export class GetNotifications {
  static readonly type = '[userId] get notifications';
  constructor(public payload: string) {}
}

export class SetNotificationFlag {
  static readonly type = '[total] set flag';
  constructor(public payload: number) {}
}
