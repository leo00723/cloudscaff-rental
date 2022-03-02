import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Action, State, StateContext } from '@ngxs/store';

export class Navigate {
  static readonly type = '[router] navigate';
  constructor(public payload: string) {}
}

@State<string>({
  name: 'router',
  defaults: '',
})
@Injectable()
export class RouterState {
  constructor(private router: Router, private ngZone: NgZone) {}

  @Action(Navigate, { cancelUncompleted: true })
  changeRoute(context: StateContext<string>, action: Navigate) {
    const path = action.payload;
    this.ngZone.run(async () => {
      await this.router.navigateByUrl(path, { replaceUrl: true });
      context.setState(path);
    });
  }
}
