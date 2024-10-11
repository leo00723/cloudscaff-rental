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
      if (isSell) {
        weight += isNaN(+item.weight) ? 0 : +item.weight * +item.sellQty;
      } else if (isDelivery) {
        weight += isNaN(+item.weight) ? 0 : +item.weight * +item.deliveredQty;
      } else if (isReturn) {
        weight += isNaN(+item.weight) ? 0 : +item.weight * +item.returnQty;
      } else {
        weight += isNaN(+item.weight)
          ? 0
          : +item.weight *
            (isShipment ? +item.shipmentQty : +item.availableQty);
      }
    }
    return `${this.decimalPipe.transform(weight.toFixed(2))} (${symbol})`;
  }
}
