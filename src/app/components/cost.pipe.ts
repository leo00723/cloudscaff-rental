import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { CompanyState } from '../shared/company/company.state';

@Pipe({
  name: 'cost',
  pure: true,
})
export class CostPipe implements PipeTransform {
  private decimalPipe = inject(DecimalPipe);
  private store = inject(Store);
  transform(items: any[], isWeekly: boolean = false): string {
    const symbol = this.store.selectSnapshot(CompanyState.company).currency
      .symbol;
    let cost = 0;
    if (items) {
      for (const item of items) {
        // Make sure item and item.weight exist
        if (!item || typeof item.hireCost === 'undefined') {
          continue;
        }

        // Convert item.weight to number and multiply by quantity
        const qty = +item.shipmentQty || 0;
        if (isWeekly) {
          cost += qty * +item.hireCost * 7;
          continue;
        }
        cost += qty * +item.hireCost;
      }
    }
    return `${symbol}${this.decimalPipe.transform(cost.toFixed(2))}`;
  }
}
