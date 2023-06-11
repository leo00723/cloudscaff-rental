import { AdditionalItem } from './additionalItem.model';
import { Company } from './company.model';
import { Estimate } from './estimate.model';
import { Item } from './item.model';
import { LabourItem } from './labourItem.model';
import { Site } from './site.model';
import { TransportItem } from './transport.model';

export class PaymentApplication {
  id: string;
  company: Company;
  value: number;
  erectionValue: number;
  appliedErectionValue: number;
  dismantleValue: number;
  appliedDismantleValue: number;
  extraHireCharge: number;
  previousGross: number;
  grossTotal: number;
  currentTotal: number;
  estimates: Estimate[];
  site: Site;
  date: any;
  code: string;
  status: string;
  dueDate: any;
  contractTotal: number;
  vat: number;
  tax: number;
  total: number;

  constructor() {
    this.date = new Date();
    this.status = 'pending';
    this.resetTotals();
    this.estimates = [];
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
    estimates.forEach((ne) => {
      const index = this.estimates.findIndex((e) => e.id === ne.id);
      if (index === -1) {
        this.estimates.push(ne);
      }
    });
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
    this.previousGross = 0;
    this.currentTotal = 0;
    this.vat = 0;
    this.tax = 0;
    this.total = 0;
  }

  updateTotals() {
    this.resetTotals();
    this.estimates.forEach((e) => {
      const t = e.scaffold.total ? +e.scaffold.total : 0;
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
      this.previousGross += e.scaffold.previousGross
        ? +e.scaffold.previousGross
        : 0;
      this.grossTotal += e.scaffold.grossTotal ? +e.scaffold.grossTotal : 0;
      this.currentTotal +=
        (e.scaffold.grossTotal ? +e.scaffold.grossTotal : 0) -
        (e.scaffold.previousGross ? +e.scaffold.previousGross : 0);
      e.attachments.forEach((item) => {
        const at = item.total ? +item.total : 0;
        this.value += item.total ? +item.total : 0;
        this.erectionValue += at * 0.7;
        this.appliedErectionValue += item.appliedErectionValue
          ? +item.appliedErectionValue
          : 0;
        this.dismantleValue += at * 0.3;
        this.appliedDismantleValue += item.appliedDismantleValue
          ? +item.appliedDismantleValue
          : 0;
        this.extraHireCharge += item.extraHireCharge
          ? +item.extraHireCharge
          : 0;
        this.previousGross += item.previousGross ? +item.previousGross : 0;
        this.grossTotal += item.grossTotal ? +item.grossTotal : 0;
        this.currentTotal +=
          (item.grossTotal ? +item.grossTotal : 0) -
          (item.previousGross ? +item.previousGross : 0);
      });
      e.labour.forEach((item) => {
        this.value += item.total ? +item.total : 0;
        this.previousGross += item.previousGross ? +item.previousGross : 0;
        this.grossTotal += item.grossTotal ? +item.grossTotal : 0;
        this.currentTotal +=
          (item.grossTotal ? +item.grossTotal : 0) -
          (item.previousGross ? +item.previousGross : 0);
      });
      e.transport.forEach((item) => {
        this.value += item.total ? +item.total : 0;
        this.previousGross += item.previousGross ? +item.previousGross : 0;
        this.grossTotal += item.grossTotal ? +item.grossTotal : 0;
        this.currentTotal +=
          (item.grossTotal ? +item.grossTotal : 0) -
          (item.previousGross ? +item.previousGross : 0);
      });
      e.additionals.forEach((item) => {
        this.value += item.total ? +item.total : 0;
        this.previousGross += item.previousGross ? +item.previousGross : 0;
        this.grossTotal += item.grossTotal ? +item.grossTotal : 0;
        this.currentTotal +=
          (item.grossTotal ? +item.grossTotal : 0) -
          (item.previousGross ? +item.previousGross : 0);
      });
      e.boards.forEach((item) => {
        this.value += item.total ? +item.total : 0;
        this.previousGross += item.previousGross ? +item.previousGross : 0;
        this.grossTotal += item.grossTotal ? +item.grossTotal : 0;
        this.currentTotal +=
          (item.grossTotal ? +item.grossTotal : 0) -
          (item.previousGross ? +item.previousGross : 0);
      });
    });
    this.vat =
      this.company.vat > 0 ? this.currentTotal * (this.company.vat / 100) : 0;
    this.tax =
      this.company.salesTax > 0
        ? this.currentTotal * (this.company.salesTax / 100)
        : 0;
    this.total = this.currentTotal + this.vat + this.tax;
  }

  updatePreviousGross(): Estimate[] {
    const est = [];
    this.estimates.forEach((val) => est.push(Object.assign({}, val)));
    // est.forEach((e, i) => {
    //   e.scaffold.previousGross = e.scaffold.grossTotal
    //     ? +e.scaffold.grossTotal
    //     : 0;
    //   e.scaffold.currentTotal = 0;
    //   console.log(
    //     e.scaffold.currentTotal,
    //     '===> ',
    //     this.estimates[i].scaffold.previousGross
    //   );
    //   e.attachments.forEach((a) => {
    //     a.previousGross = a.grossTotal ? +a.grossTotal : 0;
    //     a.currentTotal = 0;
    //   });
    // });
    return est;
  }

  addItem(type: string) {
    const newEstimate = {
      attachments: [],
      boards: [],
      labour: [],
      transport: [],
      additionals: [],
      code: '',
      id: '',
      scaffold: {},
      type,
    } as Estimate;
    this.estimates.push(newEstimate);
  }

  deleteItem(index: number) {
    this.estimates.splice(index, 1);
    this.updateTotals();
  }

  change(args, scaffold: Item, category: string) {
    const value = args.detail.value;
    const days = scaffold.isWeeks
      ? +scaffold.daysStanding / 7
      : +scaffold.daysStanding;
    switch (category) {
      case 'EP':
        {
          scaffold.appliedErectionPercentage = value;
          scaffold.appliedErectionValue =
            scaffold.erectionValue * (scaffold.appliedErectionPercentage / 100);
        }
        break;
      case 'DP':
        {
          scaffold.appliedDismantlePercentage = value;
          scaffold.appliedDismantleValue =
            scaffold.dismantleValue *
            (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'HD':
        {
          scaffold.hireDate = value;
          const hireEndDate = new Date(value);
          hireEndDate.setDate(hireEndDate.getDate() + days);
          scaffold.hireEndDate = hireEndDate.toDateString();
        }
        break;
      case 'HAN':
        {
          scaffold.handover = value;
        }
        break;
      case 'DD':
        {
          scaffold.dismantleDate = value;
        }
        break;
      case 'EH':
        {
          scaffold.extraHireWeeks = +value;
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
      case 'SD':
        {
          scaffold.description = value;
        }
        break;
      case 'SV':
        {
          scaffold.total = +value;
          scaffold.erectionValue = +(scaffold.total * 0.7).toFixed(2);
          scaffold.dismantleValue = +(scaffold.total * 0.3).toFixed(2);
          scaffold.appliedDismantleValue =
            scaffold.dismantleValue *
            (scaffold.appliedDismantlePercentage / 100);
          scaffold.appliedErectionValue =
            scaffold.erectionValue * (scaffold.appliedErectionPercentage / 100);
        }
        break;
      case 'SH':
        {
          scaffold.isWeeks = false;
          scaffold.daysStanding = +value * 7;
          const hireEndDate = new Date(scaffold.hireDate);
          hireEndDate.setDate(hireEndDate.getDate() + scaffold.daysStanding);
          scaffold.hireEndDate = hireEndDate.toDateString();
        }
        break;
      case 'EHP':
        {
          scaffold.extraHirePercentage = +value;
          scaffold.extraHire =
            scaffold.total * (scaffold.extraHirePercentage / 100);
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
      case 'EHA':
        {
          scaffold.extraHire = +value;
          scaffold.extraHireCharge =
            +scaffold.extraHire * scaffold.extraHireWeeks;
        }
        break;
      case 'EV':
        {
          scaffold.erectionValue = +value;
          scaffold.dismantleValue = +(
            scaffold.total - scaffold.erectionValue
          ).toFixed(2);
          scaffold.appliedErectionValue =
            scaffold.erectionValue * (scaffold.appliedErectionPercentage / 100);
          scaffold.appliedDismantleValue =
            scaffold.dismantleValue *
            (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'DV':
        {
          scaffold.dismantleValue = +value;
          scaffold.erectionValue = +(
            scaffold.total - scaffold.dismantleValue
          ).toFixed(2);
          scaffold.appliedErectionValue =
            scaffold.erectionValue * (scaffold.appliedErectionPercentage / 100);
          scaffold.appliedDismantleValue =
            scaffold.dismantleValue *
            (scaffold.appliedDismantlePercentage / 100);
        }
        break;
      case 'PG':
        {
          scaffold.previousGross = +value;
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
    scaffold.currentTotal =
      scaffold.grossTotal -
      (scaffold.previousGross ? +scaffold.previousGross : 0);
    this.updateTotals();
  }

  changeTotal(
    args,
    item: Item | AdditionalItem | TransportItem | LabourItem,
    category: string
  ) {
    const value = args.detail.value;
    switch (category) {
      case 'GT':
        {
          item.grossTotal = +value;
          item.currentTotal =
            item.grossTotal - (item.previousGross ? +item.previousGross : 0);
        }
        break;
    }
    this.updateTotals();
  }

  setDate(args) {
    this.dueDate = args.detail.value;
  }
}
