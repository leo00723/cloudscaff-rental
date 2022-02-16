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
import { RateProfile, RateProfiles } from 'src/app/models/rate-profiles.model';
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
      this.rates$.subscribe((rates: RateProfiles) => {
        this.rateProfiles.additionalRates = this.mergeNew(
          this.rateProfiles.additionalRates,
          rates.additionalRates
        );
        this.rateProfiles.boardRates = this.mergeNew(
          this.rateProfiles.boardRates,
          rates.boardRates
        );
        this.rateProfiles.hireRates = this.mergeNew(
          this.rateProfiles.hireRates,
          rates.hireRates
        );
        this.rateProfiles.scaffoldRates = this.mergeNew(
          this.rateProfiles.scaffoldRates,
          rates.scaffoldRates
        );
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
          this.masterSvc
            .notification()
            .toast('Rates has been updated.', 'success');
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your rates, try again!',
              'danger',
              2000
            );
        });
    });
  }

  mergeNew(oldArr: RateProfile[], newArr: RateProfile[]) {
    const hash = Object.create(null);
    const result = [newArr, oldArr].reduce((r, a) => {
      a.forEach((o) => {
        const key = ['code'].map((k) => o[k]).join('|');
        if (!hash[key]) {
          r.push(o);
          hash[key] = true;
        }
      });
      return r;
    }, []);
    return result;
  }
}
