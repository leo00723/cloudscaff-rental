import { Pipe, PipeTransform } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Pipe({
  name: 'calculate',
  pure: true,
})
export class CalculatePipe implements PipeTransform {
  transform(item: InventoryItem) {
    const totalQty = item.availableQty || 0;
    const inUseQty = item.inUseQty || 0;
    const damaged = item.damagedQty || 0;
    const maintenance = item.inMaintenanceQty || 0;
    const lost = item.lostQty || 0;
    const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    return availableQty;
  }
}
