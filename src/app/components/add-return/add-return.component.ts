import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Site } from 'src/app/models/site.model';
import { Return } from 'src/app/models/return.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { increment } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-return',
  templateUrl: './add-return.component.html',
})
export class AddReturnComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() allowSend = false;
  @Input() siteData: Site;
  @Input() set value(val: Return) {
    if (val) {
      Object.assign(this.return, val);
      this.initEditForm();
    }
  }
  return: Return = { status: 'pending', items: [] };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  searching = false;
  error = false;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    if (this.return.status !== 'sent' && !this.allowSend) {
      this.subs.add(
        this.masterSvc
          .edit()
          .getDocById(`company/${this.company.id}/siteStock`, this.siteData.id)
          .subscribe((data) => {
            this.return.items.forEach((item) => {
              const inventoryItem = data.items.find((i) => i.id === item.id);
              if (inventoryItem) {
                inventoryItem.shipmentQty = +item.shipmentQty;
              }
            });
            this.items = data.items;
          })
      );
    } else {
      this.items = this.return.items;
    }
    if (!this.isEdit) {
      this.initForm();
    }
  }
  createReturn() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const returnItems: Return = { ...this.form.value };
        returnItems.items = this.items.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        returnItems.code = `RET${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalReturns ? this.company.totalReturns + 1 : 1)
          .toString()
          .padStart(6, '0')}`;

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/returns`, returnItems);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalReturns: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Return created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating return. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  updateReturn(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.return, this.form.value);
        this.return.items = this.items.filter((item) => item.shipmentQty > 0);
        this.return.status = status;

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/returns`,
            this.return.id,
            this.return
          );

        this.masterSvc
          .notification()
          .toast('Return updated successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating return. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  update(val, item: InventoryItem, type: string) {
    switch (type) {
      case 'shipment':
        {
          item.shipmentQty = +val.detail.value;
          item.shipmentQty > item.availableQty || item.shipmentQty < 0
            ? (this.error = true)
            : (this.error = false);
        }
        break;
      case 'damaged':
        item.damagedQty = +val.detail.value;
        break;
      case 'maintenance':
        item.inMaintenanceQty = +val.detail.value;
        break;
      case 'lost':
        item.lostQty = +val.detail.value;
        break;
    }
    this.checkError(item);
  }

  search(event) {
    this.searching = true;
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item.code.toLowerCase().includes(val) ||
        item.name.toLowerCase().includes(val) ||
        item.category.toLowerCase().includes(val) ||
        !val
    );
    if (!val) {
      this.searching = false;
    }
  }

  checkError(item: InventoryItem) {
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    if (
      damaged + maintenance + lost > item.shipmentQty ||
      damaged < 0 ||
      maintenance < 0 ||
      lost < 0
    ) {
      item.error = true;
      this.error = true;
    } else {
      item.error = false;
      this.error = false;
    }
  }
  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.return.site, Validators.required],
      returnDate: [this.return.returnDate, Validators.required],
      notes: [this.return.notes, Validators.nullValidator],
      updatedBy: [this.user.id],
      status: [this.return.status, Validators.required],
      company: [this.company],
      date: [new Date()],
    });
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.siteData, Validators.required],
      returnDate: ['', Validators.required],
      notes: ['', Validators.nullValidator],
      createdBy: [this.user.id],
      status: ['pending', Validators.required],
      company: [this.company],
      date: [new Date()],
    });
  }
}
