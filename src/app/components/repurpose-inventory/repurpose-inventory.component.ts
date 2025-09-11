import { Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import cloneDeep from 'lodash/cloneDeep';
import { orderBy } from '@angular/fire/firestore';

@Component({
  selector: 'app-repurpose-inventory',
  templateUrl: './repurpose-inventory.component.html',
  styles: [],
})
export class RepurposeInventoryComponent implements OnInit {
  @Input() donarItem: InventoryItem;
  recipientItem: InventoryItem;
  user: User;
  company: Company;
  loading = false;
  inventoryItems$: Observable<InventoryItem[]>;
  qty: number;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.inventoryItems$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.company.id}/stockItems`, [
        orderBy('category', 'asc'),
        orderBy('name', 'asc'),
        orderBy('size', 'asc'),
      ])
      .pipe(
        map((items) =>
          items.map((item) => ({
            ...item,
            search: `${item.category} - ${item.size} - ${item.name}`,
          }))
        )
      );
  }
  ngOnInit(): void {}

  selectComponent(args) {
    this.recipientItem = args[0];
  }

  addYardQty(item: InventoryItem, addQty: number, comment: string) {
    item.yardQty = +item.yardQty + addQty;
    item.availableQty = +item.yardQty;
    const log = {
      message: `Added ${addQty} items to Total Qty.`,
      user: this.user,
      date: new Date(),
      status: 'add',
      comment,
    };
    if (item.log) {
      item.log.push(log);
    } else {
      item.log = [log];
    }
  }

  removeYardQty(item: InventoryItem, removeQty: number, comment: string) {
    const damagedQty = +item.damagedQty;
    if (damagedQty < removeQty) {
      this.masterSvc
        .notification()
        .toast(
          'You cannot remove more items than your Available Quantity',
          'danger',
          5000
        );
    } else {
      item.damagedQty = damagedQty - removeQty;
      const log = {
        message: `Repurposed ${removeQty} damaged items.`,
        user: this.user,
        date: new Date(),
        status: 'remove',
        comment,
      };
      if (item.log) {
        item.log.push(log);
      } else {
        item.log = [log];
      }
    }
  }

  transfer() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      const donar = cloneDeep(this.donarItem);
      const recipient = cloneDeep(this.recipientItem);
      this.removeYardQty(
        donar,
        this.qty,
        `Damaged items sent to ${recipient.search}`
      );
      this.addYardQty(
        recipient,
        this.qty,
        `Damaged items received from ${donar.category} - ${donar.size} - ${donar.name}`
      );
      this.company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);
      try {
        await Promise.all([
          this.masterSvc
            .edit()
            .updateDoc(`company/${this.company.id}/stockItems`, donar.id, {
              damagedQty: donar.damagedQty,
              log: donar.log,
            }),
          this.masterSvc
            .edit()
            .updateDoc(`company/${this.company.id}/stockItems`, recipient.id, {
              yardQty: recipient.yardQty,
              availableQty: recipient.availableQty,
              log: recipient.log,
            }),
        ]);
        this.masterSvc.modal().dismiss(undefined, 'close', 'repurpose');
        this.masterSvc.modal().dismiss(undefined, 'close', 'editStockItem');
        this.masterSvc
          .notification()
          .toast('Transfer completed sucessfully', 'success');
      } catch (error) {
        this.masterSvc
          .notification()
          .toast('Something went wrong please try again!', 'danger');
      } finally {
        this.loading = false;
      }
    });
  }

  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'repurpose');
  }
}
