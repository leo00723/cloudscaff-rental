import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { RateProfiles } from 'src/app/models/rate-profiles.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-rate-profiles',
  templateUrl: './rate-profiles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateProfilesComponent implements OnDestroy, OnInit {
  @Input() companyId: string;
  rateProfiles = new RateProfiles();
  company$: Observable<Company>;
  rates$: Observable<any>;
  loading = false;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
    this.rates$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocById(
              `company/${user.company}/rateProfiles`,
              'estimateRates'
            );
        } else {
          return of(false);
        }
      })
    );
  }
  ngOnInit(): void {
    this.subs.add(
      this.rates$.subscribe((rates) => {
        this.rateProfiles = rates;
      })
    );
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  trackItems(index: number, itemObject: any) {
    return itemObject.code;
  }

  updateRates(companyId: string) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.masterSvc
        .edit()
        .setDoc(
          `company/${companyId}/rateProfiles`,
          this.rateProfiles,
          'estimateRates'
        )
        .then(() => {
          this.loading = false;
          this.masterSvc.notification().successToast('Rates has been updated.');
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong updating your rates, try again!',
              2000
            );
        });
    });
  }
}
