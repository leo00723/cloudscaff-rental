import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs';
import { EditService } from 'src/app/services/edit.service';
import { GetVersion, SetVersion } from './app.actions';

@State<{ version: string; message: string }>({
  name: 'app',
  defaults: null,
})
@Injectable()
export class AppState {
  constructor(private editSvc: EditService) {}

  @Action(SetVersion)
  setCompany(
    { setState }: StateContext<{ version: string; message: string }>,
    { payload }: SetVersion
  ) {
    setState(payload);
  }

  @Action(GetVersion, { cancelUncompleted: true })
  getVersion({ dispatch }: StateContext<string>, { payload }: GetVersion) {
    return this.editSvc.getDocById('version', payload).pipe(
      tap(async (version: { version: string; message: string }) => {
        dispatch(new SetVersion(version));
      }),
      catchError((error) => dispatch(new SetVersion(null)))
    );
  }

  @Selector()
  static version(state: { version: string; message: string }) {
    return state;
  }
}
