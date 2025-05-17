import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { CompanyState } from '../shared/company/company.state';

@Pipe({
  name: 'weight',
  pure: true,
})
export class WeightPipe implements PipeTransform {
  private decimalPipe = inject(DecimalPipe);
  private store = inject(Store);
  transform(
    items: any[],
    isShipment?: boolean,
    isSell?: boolean,
    isDelivery?: boolean,
    isReturn?: boolean
  ) {
    const symbol = this.store.selectSnapshot(CompanyState.company).mass.symbol;
    let weight = 0;
    for (const item of items) {
      // Make sure item and item.weight exist
      if (!item || typeof item.weight === 'undefined') {
        continue;
      }

      let qty = 0;
      if (isSell) {
        qty = +item.sellQty || 0;
      } else if (isDelivery) {
        qty = +item.deliveredQty || 0;
      } else if (isReturn) {
        qty = +item.returnQty || 0;
      } else if (isShipment) {
        qty = +item.shipmentQty || 0;
      } else {
        // For inventory calculation, use different properties
        qty = +item.yardQty || 0; // Changed from availableQty to yardQty
      }

      // Convert item.weight to number and multiply by quantity
      const itemWeight = +item.weight || 0;
      weight += itemWeight * qty;
    }
    return `${this.decimalPipe.transform(weight.toFixed(2))} (${symbol})`;
  }
}
