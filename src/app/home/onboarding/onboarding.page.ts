import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';
import { Navigate } from 'src/app/shared/router.state';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
})
export class OnboardingPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  constructor(private store: Store) {}

  ngOnInit() {}

  next({ user, company }, settings: boolean) {
    if (!user?.needsSetup && !company?.needsSetup) {
      if (settings) this.store.dispatch(new Navigate('/dashboard/settings'));
      else this.store.dispatch(new Navigate('/dashboard/sites'));
    }
  }
}
