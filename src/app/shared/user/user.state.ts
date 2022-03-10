import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { GetCompany, SetCompany } from 'src/app/shared/company/company.actions';
import { Navigate } from '../router.state';
import { GetUser, SetUser } from './user.actions';

@State<User>({
  name: 'user',
  defaults: null,
})
@Injectable()
export class UserState {
  constructor(private editSvc: EditService) {}
  @Action(SetUser)
  setUser({ setState }: StateContext<User>, { payload }: SetUser) {
    setState(payload);
  }

  @Action(GetUser, { cancelUncompleted: true })
  getUser({ dispatch }: StateContext<string>, { payload }: GetUser) {
    return this.editSvc.getDocById('users', payload).pipe(
      tap(async (user: User) => {
        dispatch([new SetUser(user), new GetCompany(user.company)]);
        if (user.needsSetup) {
          dispatch(new Navigate('/dashboard/onboarding'));
        }
      }),
      catchError(() => dispatch([new SetUser(null), new SetCompany(null)]))
    );
  }

  @Selector()
  static user(state: User) {
    return state;
  }
}
