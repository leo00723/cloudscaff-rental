import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { MasterService } from '../services/master.service';
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
  styleUrls: ['./estimates.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimatesPage implements OnInit {
  estimates$: Observable<any[]>;
  company$: Observable<Company>;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
  }

  ngOnInit() {
    this.estimates$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyIdOrdered(
              `company/${user.company}/estimates`,
              'date',
              'desc'
            );
        } else {
          return of(false);
        }
      })
    ) as Observable<any[]>;
  }

  editEstimate(id: string) {
    this.masterSvc
      .router()
      .navigate([`/home/editEstimate/${id}`], { replaceUrl: true });
  }
}
