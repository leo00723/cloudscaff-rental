import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { EditService } from 'src/app/services/edit.service';
import { XeroService } from 'src/app/services/xero.service';
import { Navigate } from '../router.state';
import { GetCompany, SetCompany } from './company.actions';

@State<Company>({
  name: 'company',
  defaults: null,
})
@Injectable()
export class CompanyState {
  tokenUpdated = false;
  constructor(private editSvc: EditService, private xeroService: XeroService) {}
  @Action(SetCompany)
  setCompany({ setState }: StateContext<Company>, { payload }: SetCompany) {
    setState(payload);
  }

  @Action(GetCompany, { cancelUncompleted: true })
  getCompany({ dispatch }: StateContext<string>, { payload }: GetCompany) {
    return this.editSvc.getDocById('company', payload).pipe(
      tap(async (company: Company) => {
        dispatch(new SetCompany(company));
        if (company.needsSetup) {
          dispatch(new Navigate('/dashboard/onboarding'));
        } else {
          if (company.trialEnded) {
            dispatch(new Navigate('/trial-ended'));
          }
        }
      }),
      catchError((error) => dispatch(new SetCompany(null)))
    );
  }

  @Selector()
  static company(state: Company) {
    return state;
  }
}
