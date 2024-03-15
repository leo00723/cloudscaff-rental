import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { CompanyState } from '../shared/company/company.state';

@Pipe({
  name: 'weight',
  pure: true,
})
export class WeightPipe implements PipeTransform {
  private decimalPipe = inject(DecimalPipe);
  private store = inject(Store);
  transform(items: InventoryItem[], isShipment?: boolean) {
    const symbol = this.store.selectSnapshot(CompanyState.company).mass.symbol;
    let weight = 0;
    for (const item of items) {
      weight += isNaN(+item.weight)
        ? 0
        : +item.weight * (isShipment ? +item.shipmentQty : +item.availableQty);
    }
    return `${this.decimalPipe.transform(weight.toFixed(2))} (${symbol})`;
  }
}
