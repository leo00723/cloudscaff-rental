import { Injectable } from '@angular/core';
import { ScaffoldCost } from '../models/scaffold-cost';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class HandoverService {
  private measure = new ScaffoldCost();

  constructor() {}

  checkChanges(oldItem: Item, newItem: Item) {
    if (oldItem && newItem) {
      const changes = this.measure.scaffoldCost(oldItem, newItem);
      return [...changes.dismantle, ...changes.erection];
    } else if (!oldItem) {
      return [
        {
          length: newItem.length,
          width: newItem.width,
          height: newItem.height,
          type: 'added',
        },
      ];
    } else if (!newItem) {
      return [
        {
          length: oldItem.length,
          width: oldItem.width,
          height: oldItem.height,
          type: 'Removed',
        },
      ];
    }
  }
}
