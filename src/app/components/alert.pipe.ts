import { Pipe, PipeTransform } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Pipe({
  name: 'alert',
  pure: true,
})
export class AlertPipe implements PipeTransform {
  transform(item: InventoryItem): string {
    if (!item) {
      return 'undefined';
    }

    const {
      code = '',
      yardQty = 0,
      inUseQty = 0,
      reservedQty = 0,
      damagedQty = 0,
      inMaintenanceQty = 0,
      lostQty = 0,
      lowPercentage,
    } = item;

    const availableQty =
      yardQty -
      inUseQty -
      reservedQty -
      damagedQty -
      inMaintenanceQty -
      lostQty;
    const availablePercentage = (availableQty / yardQty) * 100;

    if (availableQty <= 0) {
      return 'danger';
    } else if (lowPercentage && availablePercentage < lowPercentage) {
      return 'warning';
    }

    return 'success';
  }
}
