import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { Site } from 'src/app/models/site.model';
import { EditService } from 'src/app/services/edit.service';
import { GetSites, SetSite, SetSites } from './sites.actions';

@State<Site[]>({
  name: 'sites',
  defaults: null,
})
@Injectable()
export class SitesState {
  constructor(private editSvc: EditService) {}
  @Action(SetSites)
  setSites({ setState }: StateContext<Site[]>, { payload }: SetSites) {
    setState(payload);
  }

  @Action(GetSites, { cancelUncompleted: true })
  getSites({ dispatch }: StateContext<string>, { payload }: GetSites) {
    return this.editSvc
      .getCollectionOrdered(`company/${payload}/sites`, 'code', 'desc')
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

@State<Site>({
  name: 'site',
  defaults: null,
})
@Injectable()
export class SiteState {
  @Action(SetSite)
  setSite({ setState }: StateContext<Site>, { payload }: SetSite) {
    return setState(payload);
  }

  @Selector()
  static site(state: Site) {
    return state;
  }
}
