import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Return } from 'src/app/models/return.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

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
    this.user = this.masterSvc.auth().getUser();
    this.company = this.masterSvc.auth().getCompany();
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
  async createReturn() {
    await this.masterSvc.notification().presentAlertConfirm(async () => {
      this.createDoc(false);
    });
  }
  async updateReturn(status: string) {
    await this.masterSvc.notification().presentAlertConfirm(async () => {
      this.updateDoc(status, false);
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
  returnAll() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      for (const item of this.items) {
        item.shipmentQty = item.availableQty;
      }
      this.autoSave();
    }, 'Are you sure you want to return all items?');
  }

  autoSave() {
    if (this.isEdit) {
      if (this.return.status === 'pending') {
        this.updateDoc('pending', true);
      }
    } else {
      this.createDoc(true);
    }
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

  private async createDoc(isAutoUpdate?: boolean) {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      this.company = this.masterSvc.auth().getCompany();

      const returnItems: Return = {
        ...this.form.value,
        items: this.items.filter((item) => item.shipmentQty > 0),
        code: this.masterSvc
          .edit()
          .generateDocCode(this.company.totalReturns, 'RET'),
      };

      const doc = await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/returns`, returnItems);

      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        totalReturns: increment(1),
      });

      if (!isAutoUpdate) {
        this.masterSvc
          .notification()
          .toast('Return created successfully', 'success');
        this.close();
      } else {
        this.return.id = doc.id;
        this.isEdit = true;
      }
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong creating return. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }

  private async updateDoc(status: string, isAutoUpdate?: boolean) {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      Object.assign(this.return, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.shipmentQty > 0),
        status,
      });

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/returns`,
          this.return.id,
          this.return
        );

      if (!isAutoUpdate) {
        this.masterSvc
          .notification()
          .toast('Return updated successfully', 'success');
        this.close();
      }
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating return. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }
}
