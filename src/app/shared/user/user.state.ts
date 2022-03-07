import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { EditprofileComponent } from 'src/app/components/editprofile/editprofile.component';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { GetCompany, SetCompany } from 'src/app/shared/company/company.actions';
import { GetUser, SetUser, UpdateProfile } from './user.actions';

@State<User>({
  name: 'user',
  defaults: null,
})
@Injectable()
export class UserState {
  constructor(
    private editSvc: EditService,
    private modalSvc: ModalController
  ) {}
  @Action(SetUser)
  setUser({ setState }: StateContext<User>, { payload }: SetUser) {
    setState(payload);
  }

  @Action(GetUser, { cancelUncompleted: true })
  getUser({ dispatch }: StateContext<string>, { payload }: GetUser) {
    return this.editSvc.getDocById('users', payload).pipe(
      tap(async (user: User) => {
        const m = await this.modalSvc.getTop();
        if (m) {
          if (user.needsSetup && m.id !== 'editProfile')
            dispatch(new UpdateProfile('Complete Profile'));
        } else {
          if (user.needsSetup) dispatch(new UpdateProfile('Complete Profile'));
        }

        dispatch([new SetUser(user), new GetCompany(user.company)]);
      }),
      catchError(() => dispatch([new SetUser(null), new SetCompany(null)]))
    );
  }

  @Action(UpdateProfile, { cancelUncompleted: true })
  async updateProfile(
    { dispatch }: StateContext<string>,
    { payload }: UpdateProfile
  ) {
    const modal = await this.modalSvc.create({
      component: EditprofileComponent,
      id: 'editProfile',
      backdropDismiss: false,
      keyboardClose: false,
      swipeToClose: false,
      componentProps: {
        title: payload,
      },
    });
    return await modal.present();
  }

  @Selector()
  static user(state: User) {
    return state;
  }
}
