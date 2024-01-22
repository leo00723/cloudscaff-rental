import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetNotificationFlag } from './notifications.actions';

@State<number>({
  name: 'notificationFlag',
  defaults: null,
})
@Injectable()
export class NotificationFlagState {
  constructor() {}

  @Action(SetNotificationFlag)
  setNotificationFlag(
    { setState }: StateContext<number>,
    { payload }: SetNotificationFlag
  ) {
    setState(payload);
  }

  @Selector()
  static notificationFlag(state: number) {
    return state;
  }
}
