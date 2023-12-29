import { Pipe, PipeTransform } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Pipe({
  name: 'weight',
  pure: true,
})
export class WeightPipe implements PipeTransform {
  transform(items: InventoryItem[]) {
    let weight = 0;
    for (const item of items) {
      weight += isNaN(+item.weight) ? 0 : +item.weight * +item.availableQty;
    }
    return weight.toFixed(2);
  }
}
