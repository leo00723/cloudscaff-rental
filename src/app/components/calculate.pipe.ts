import { Pipe, PipeTransform } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Pipe({
  name: 'calculate',
  pure: true,
})
export class CalculatePipe implements PipeTransform {
  transform(item: InventoryItem, isD?: boolean) {
    const totalQty = item.yardQty || 0;
    const inUseQty = item.inUseQty || 0;
    const reservedQty = item.reservedQty || 0;
    const damaged = item.damagedQty || 0;
    const maintenance = item.inMaintenanceQty || 0;
    const lost = item.lostQty || 0;
    const availableQty =
      totalQty - inUseQty - damaged - maintenance - lost - reservedQty;
    let deficit = 0;
    if (isD) {
      if (item.shipmentQty > availableQty) {
        deficit = item.shipmentQty - availableQty;
      }
      return deficit;
    } else {
      return availableQty;
    }
  }
}
