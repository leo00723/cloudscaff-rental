import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Item } from 'src/app/models/item.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-payment-application',
  templateUrl: './add-payment-application.component.html',
  styles: [],
})
export class AddPaymentApplicationComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() site$: Observable<Site>;
  @Input() estimates$: Observable<Estimate[]>;
  @Input() bulkEstimates: BulkEstimate[];
  estimates: Estimate[];
  loading = false;
  company: Company;
  date = new Date();

  V = 0;
  EV = 0;
  AEV = 0;
  DV = 0;
  ADV = 0;
  EHC = 0;
  GT = 0;

  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  change(args, scaffold: Item, category: string) {
    const days = scaffold.isWeeks
      ? +scaffold.daysStanding / 7
      : +scaffold.daysStanding;
    switch (category) {
      case 'EP':
        {
          scaffold.appliedErectionPercentage = args.detail.value;
          scaffold.appliedErectionValue =
            (scaffold.total + scaffold.hireTotal) *
            0.7 *
            (scaffold.appliedErectionPercentage / 100);
        }
        break;
      case 'DP':
        {
          scaffold.appliedDismantlePercentage = args.detail.value;
          scaffold.appliedDismantleValue =
            (scaffold.total + scaffold.hireTotal) *
            0.3 *
            (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'HD':
        {
          scaffold.hireDate = args.detail.value;
          scaffold.hireEndDate = new Date(args.detail.value);
          scaffold.hireEndDate.setDate(scaffold.hireEndDate.getDate() + days);
        }
        break;
      case 'DD':
        {
          scaffold.dismantleDate = args.detail.value;
        }
        break;
      case 'EH':
        {
          scaffold.extraHireWeeks = +args.detail.value;
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
    }

    const EH = scaffold.extraHireCharge ? scaffold.extraHireCharge : 0;
    const EV = scaffold.appliedErectionValue
      ? scaffold.appliedErectionValue
      : 0;
    const DV = scaffold.appliedDismantleValue
      ? scaffold.appliedDismantleValue
      : 0;
    scaffold.grossTotal = EV + DV + EH;
    this.updateTotals();
  }

  ngOnInit(): void {
    this.subs.add(
      this.estimates$.subscribe((estimates) => {
        this.estimates = estimates;
        this.updateTotals();
      })
    );
  }

  close() {
    this.masterSvc.modal().dismiss();
  }

  private updateTotals() {
    this.V = 0;
    this.EV = 0;
    this.AEV = 0;
    this.DV = 0;
    this.ADV = 0;
    this.EHC = 0;
    this.GT = 0;
    this.estimates.forEach((e) => {
      const st = e.scaffold.total ? +e.scaffold.total : 0;
      const ht = e.scaffold.hireTotal ? +e.scaffold.hireTotal : 0;
      const t = st + ht;
      this.V += t;
      this.EV += t * 0.7;
      this.AEV += e.scaffold.appliedErectionValue
        ? +e.scaffold.appliedErectionValue
        : 0;
      this.DV += t * 0.3;
      this.ADV += e.scaffold.appliedDismantleValue
        ? +e.scaffold.appliedDismantleValue
        : 0;
      this.EHC += e.scaffold.extraHireCharge ? +e.scaffold.extraHireCharge : 0;
      this.GT += e.scaffold.grossTotal ? +e.scaffold.grossTotal : 0;
      e.attachments.forEach((a) => {
        const ast = a.total ? +a.total : 0;
        const aht = a.hireTotal ? +a.hireTotal : 0;
        const at = ast + aht;
        this.V += at;
        this.EV += at * 0.7;
        this.AEV += a.appliedErectionValue ? +a.appliedErectionValue : 0;
        this.DV += at * 0.3;
        this.ADV += a.appliedDismantleValue ? +a.appliedDismantleValue : 0;
        this.EHC += a.extraHireCharge ? +a.extraHireCharge : 0;
        this.GT += a.grossTotal ? +a.grossTotal : 0;
      });
    });
  }
}
