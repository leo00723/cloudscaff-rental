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
  page = 0;
  constructor(private router: Router) {}

  ngOnInit() {}

  next({ user, company }, settings: boolean) {
    console.log('emmited');
    if (!user?.needsSetup && !company?.needsSetup) {
      if (settings) {
        this.router.navigateByUrl('/dashboard/settings');
      } else {
        this.router.navigateByUrl('/dashboard/sites');
      }
    }
  }
}
