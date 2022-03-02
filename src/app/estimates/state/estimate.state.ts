import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { Estimate } from 'src/app/models/estimate.model';
import { EditService } from 'src/app/services/edit.service';
import { GetEstimates, SetEstimates } from './estimate.actions';

@State<Estimate[]>({
  name: 'estimates',
  defaults: null,
})
@Injectable()
export class EstimatesState {
  constructor(private editSvc: EditService) {}
  @Action(SetEstimates)
  setEstimates(
    { setState }: StateContext<Estimate[]>,
    { payload }: SetEstimates
  ) {
    setState(payload);
  }

  @Action(GetEstimates, { cancelUncompleted: true })
  getEstimates({ dispatch }: StateContext<string>, { payload }: GetEstimates) {
    return this.editSvc
      .getCollectionOrdered(`company/${payload}/estimates`, 'code', 'desc')
      .pipe(
        tap((estimates: Estimate[]) => {
          dispatch(new SetEstimates(estimates));
        }),
        catchError(() => dispatch(new SetEstimates(null)))
      );
  }

  @Selector()
  static estimates(state: Estimate[]) {
    return state;
  }
}
