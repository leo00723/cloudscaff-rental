import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { Site } from 'src/app/models/site.model';
import { EditService } from 'src/app/services/edit.service';
import { GetSites, SetSites } from './sites.actions';

@State<Site[]>({
  name: 'sites',
  defaults: null,
})
@Injectable()
export class SitesState {
  constructor(private editSvc: EditService, private store: Store) {}
  @Action(SetSites)
  setSites({ setState }: StateContext<Site[]>, { payload }: SetSites) {
    setState(payload);
  }

  @Action(GetSites, { cancelUncompleted: true })
  getSites({ dispatch }: StateContext<string>, { payload }: GetSites) {
    return this.editSvc
      .getDocsByCompanyIdOrdered(`company/${payload}/sites`, 'code', 'desc')
      .pipe(
        tap((sites: Site[]) => {
          dispatch(new SetSites(sites));
        }),
        catchError(() => dispatch(new SetSites(null)))
      );
  }

  @Selector()
  static sites(state: Site[]) {
    return state;
  }
}
