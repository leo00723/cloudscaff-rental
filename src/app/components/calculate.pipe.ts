import { Pipe } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Pipe({
  name: 'calculate',
  pure: true,
})
export class CalculatePipe {
  transform(item: InventoryItem) {
    const totalQty = item.availableQty ? item.availableQty : 0;
    const inUseQty = item.inUseQty ? item.inUseQty : 0;
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    return availableQty;
  }
}
