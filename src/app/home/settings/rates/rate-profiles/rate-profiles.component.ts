import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { RateProfile, RateProfiles } from 'src/app/models/rate-profiles.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-rate-profiles',
  templateUrl: './rate-profiles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateProfilesComponent implements OnDestroy, OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  rateProfiles = new RateProfiles();
  rates$: Observable<any>;
  loading = false;
  isLoading = true;
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {
    this.rates$ = this.user$.pipe(
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
        if (rates) {
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
        }

        this.isLoading = false;
        this.change.detectChanges();
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
          console.error(error);
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
