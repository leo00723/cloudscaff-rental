import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-budget-breakdown',
  templateUrl: './budget-breakdown.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetBreakdownComponent implements OnInit {
  @Input() estimate:
    | Estimate
    | BulkEstimate
    | BulkInventoryEstimate
    | InventoryEstimate;
  company: Company;
  user: User;
  form: FormGroup;
  error = false;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
  }

  ngOnInit(): void {
    this.form = this.masterSvc.fb().group({
      subtotal: [this.estimate.subtotal, Validators.required],
      margin: [
        this.estimate.budget ? this.estimate.budget.margin : 0,
        [Validators.required, Validators.min(0)],
      ],
      cost: [
        this.estimate.budget ? this.estimate.budget.cost : 0,
        Validators.required,
      ],
      profit: [
        this.estimate.budget ? this.estimate.budget.profit : 0,
        [Validators.required],
      ],
      profitPercentage: [
        this.estimate.budget ? this.estimate.budget.profitPercentage : 0,
        [Validators.required],
      ],
      labourTotal: [
        this.estimate.budget ? this.estimate.budget.labourTotal : 0,
        [Validators.required, Validators.min(0)],
      ],
      labourPercentage: [
        this.estimate.budget ? this.estimate.budget.labourPercentage : 0,
        [Validators.required, Validators.min(0)],
      ],
      materialTotal: [
        this.estimate.budget ? this.estimate.budget.materialTotal : 0,
        [Validators.required, Validators.min(0)],
      ],
      materialPercentage: [
        this.estimate.budget ? this.estimate.budget.materialPercentage : 0,
        [Validators.required, Validators.min(0)],
      ],
      transportTotal: [
        this.estimate.budget ? this.estimate.budget.transportTotal : 0,
        [Validators.required, Validators.min(0)],
      ],
      transportPercentage: [
        this.estimate.budget ? this.estimate.budget.transportPercentage : 0,
        [Validators.required, Validators.min(0)],
      ],
      labourRate: [
        this.estimate.budget ? this.estimate.budget.labourRate : 0,
        [Validators.required, Validators.min(0)],
      ],
      noOps: [
        this.estimate.budget ? this.estimate.budget.noOps : 0,
        [Validators.required, Validators.min(0)],
      ],
      totalPerDay: [
        this.estimate.budget ? this.estimate.budget.totalPerDay : 0,
        [Validators.required, Validators.min(0)],
      ],
      days: [
        this.estimate.budget ? this.estimate.budget.days : 0,
        [Validators.required, Validators.min(0)],
      ],
      weeks: [
        this.estimate.budget ? this.estimate.budget.weeks : 0,
        [Validators.required, Validators.min(0)],
      ],
    });
    this.update();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  update() {
    const subtotal = +this.field('subtotal').value;
    const margin = +this.field('margin').value / 100;
    const profit = +(subtotal * margin).toFixed(2);
    const cost = +(subtotal - profit).toFixed(2);
    this.field('cost').setValue(cost);
    this.field('profit').setValue(profit);
    this.field('profitPercentage').setValue((profit / subtotal) * 100);
    this.updateSpend();
  }
  updateSpend() {
    const cost = +this.field('cost').value;
    const labour = +this.field('labourPercentage').value / 100;
    const material = +this.field('materialPercentage').value / 100;
    const transport = +this.field('transportPercentage').value / 100;
    labour + material + transport > 1
      ? (this.error = true)
      : (this.error = false);

    const labourTotal = +(cost * labour).toFixed(2);
    const materialTotal = +(cost * material).toFixed(2);
    const transportTotal = +(cost * transport).toFixed(2);
    this.field('labourTotal').setValue(labourTotal);
    this.field('materialTotal').setValue(materialTotal);
    this.field('transportTotal').setValue(transportTotal);
    this.updateLabour();
  }
  updateLabour() {
    const labourRate = +this.field('labourRate').value;
    const noOps = +this.field('noOps').value;
    const totalPerDay = +(labourRate * noOps).toFixed(2);
    const days = Math.round(+this.field('labourTotal').value / totalPerDay);
    const weeks = Math.round(days / 5);
    this.field('totalPerDay').setValue(totalPerDay);
    this.field('days').setValue(days);
    this.field('weeks').setValue(weeks);
    this.estimate.budget = this.form.value;
  }

  async download() {
    const pdf = await this.masterSvc
      .pdf()
      .generateBudget(this.estimate, this.company);
    this.masterSvc.pdf().handlePdf(pdf, `${this.estimate.code}-Budget`);
  }
}
