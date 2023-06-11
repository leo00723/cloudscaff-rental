import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Company } from '../models/company.model';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  templateUrl: './trial-ended.page.html',
})
export class TrialEndedPage implements OnDestroy {
  @Select() company$: Observable<Company>;
  private sub: Subscription;
  constructor(private router: Router) {
    this.sub = this.company$.subscribe((company) => {
      if (!company.trialEnded) {
        this.router.navigateByUrl('/dashboard/sites');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
