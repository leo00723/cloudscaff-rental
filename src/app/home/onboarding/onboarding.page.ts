import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
})
export class OnboardingPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;

  constructor(private router: Router) {}

  ngOnInit() {}

  next({ user, company }) {
    if (!(user?.needsSetup || company?.needsSetup)) {
      this.router.navigateByUrl('/dashboard/sites', { replaceUrl: true });
    }
  }
}
