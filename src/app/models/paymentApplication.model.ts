import { Company } from './company.model';
import { Estimate } from './estimate.model';
import { Site } from './site.model';

export class PaymentApplication {
  id: string;
  company: Company;
  value: number;
  erectionValue: number;
  appliedErectionValue: number;
  dismantleValue: number;
  appliedDismantleValue: number;
  extraHireCharge: number;
  grossTotal: number;
  currentTotal: number;
  estimates: Estimate[];
  site: Site;
  date: any;
  code: string;
  status: string;

  constructor() {
    this.date = new Date();
    this.status = 'pending';
    this.resetTotals();
  }

  setCompany(company: Company, updateCode?: boolean) {
    this.company = company;
    if (updateCode) {
      this.code = `PAY${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${(this.company.totalPaymentApplications
        ? this.company.totalPaymentApplications + 1
        : 1
      )
        .toString()
        .padStart(6, '0')}`;
    }
  }

  setSite(site: Site) {
    this.site = site;
  }
  setEstimates(estimates: Estimate[]) {
    this.estimates = estimates;
    this.updateTotals();
  }

  resetTotals() {
    this.value = 0;
    this.erectionValue = 0;
    this.appliedErectionValue = 0;
    this.dismantleValue = 0;
    this.appliedDismantleValue = 0;
    this.extraHireCharge = 0;
    this.grossTotal = 0;
    this.currentTotal = 0;
  }

  updateTotals() {
    this.resetTotals();
    this.estimates.forEach((e) => {
      const st = e.scaffold.total ? +e.scaffold.total : 0;
      const ht = e.scaffold.hireTotal ? +e.scaffold.hireTotal : 0;
      const t = st + ht;
      this.value += t;
      this.erectionValue += t * 0.7;
      this.appliedErectionValue += e.scaffold.appliedErectionValue
        ? +e.scaffold.appliedErectionValue
        : 0;
      this.dismantleValue += t * 0.3;
      this.appliedDismantleValue += e.scaffold.appliedDismantleValue
        ? +e.scaffold.appliedDismantleValue
        : 0;
      this.extraHireCharge += e.scaffold.extraHireCharge
        ? +e.scaffold.extraHireCharge
        : 0;
      this.grossTotal += e.scaffold.grossTotal ? +e.scaffold.grossTotal : 0;
      this.currentTotal +=
        (e.scaffold.grossTotal ? +e.scaffold.grossTotal : 0) -
        (e.scaffold.previousGross ? +e.scaffold.previousGross : 0);
      e.attachments.forEach((a) => {
        const ast = a.total ? +a.total : 0;
        const aht = a.hireTotal ? +a.hireTotal : 0;
        const at = ast + aht;
        this.value += at;
        this.erectionValue += at * 0.7;
        this.appliedErectionValue += a.appliedErectionValue
          ? +a.appliedErectionValue
          : 0;
        this.dismantleValue += at * 0.3;
        this.appliedDismantleValue += a.appliedDismantleValue
          ? +a.appliedDismantleValue
          : 0;
        this.extraHireCharge += a.extraHireCharge ? +a.extraHireCharge : 0;
        this.grossTotal += a.grossTotal ? +a.grossTotal : 0;
        this.currentTotal +=
          (a.grossTotal ? +a.grossTotal : 0) -
          (a.previousGross ? +a.previousGross : 0);
      });
    });
  }
}
