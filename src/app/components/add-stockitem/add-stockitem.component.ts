import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { RepurposeInventoryComponent } from '../repurpose-inventory/repurpose-inventory.component';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';

@Component({
  selector: 'app-add-stockitem',
  templateUrl: './add-stockitem.component.html',
  styles: [],
})
export class AddStockitemComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: InventoryItem) {
    if (val) {
      this.inventoryItem = { ...val };
      this.inventoryItemBackup = { ...val };
      this.initEditForm();
    }
  }
  inventoryItem: InventoryItem = {};
  inventoryItemBackup: InventoryItem = {};
  form: FormGroup;
  company: Company;
  user: User;
  loading = false;
  categories$: Observable<any>;
  removeQty = 0;
  addQty = 0;
  moveQty = 0;
  maintenanceQty = 0;
  damagedQty = 0;
  comment = '';

  operations = [
    {
      title: 'Remove from Total Qty',
      value: this.removeQty,
      color: 'danger',
      buttonLabel: 'Remove',
      onChange: (value: number) => (this.removeQty = value),
      onClick: () => this.removeYardQty(),
    },
    {
      title: 'Add to Total Qty',
      value: this.addQty,
      color: 'success',
      buttonLabel: 'Add',
      onChange: (value: number) => (this.addQty = value),
      onClick: () => this.addYardQty(),
    },
    {
      title: 'Move Maintenance to Available',
      value: this.moveQty,
      color: 'warning',
      buttonLabel: 'Move',
      onChange: (value: number) => (this.moveQty = value),
      onClick: () => this.moveToYard(),
    },
    {
      title: 'Move Available to Maintenance',
      value: this.maintenanceQty,
      color: 'warning',
      buttonLabel: 'Move',
      onChange: (value: number) => (this.maintenanceQty = value),
      onClick: () =>
        this.moveTo(
          'Available',
          'Maintenance',
          'inMaintenanceQty',
          this.maintenanceQty
        ),
    },
    {
      title: 'Move Available to Damaged',
      value: this.damagedQty,
      color: 'warning',
      buttonLabel: 'Move',
      onChange: (value: number) => (this.damagedQty = value),
      onClick: () =>
        this.moveTo('Available', 'Damaged', 'damagedQty', this.damagedQty),
    },
  ];
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.categories$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/templates`, 'componentTypes');
  }

  ngOnInit(): void {
    if (!this.isEdit) {
      this.initForm();
    }
  }

  //update the totals for a category
  update() {
    const yard = +this.field('yardQty').value;
    this.field('availableQty').setValue(yard);
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  changeCategory(event) {
    if (event[0] === 'add') {
      window.open(
        'https://app.cloudscaff.com/dashboard/settings/templates/component',
        '_blank'
      );
    } else {
      this.field('categoryType').setValue(event[0]);
      this.field('category').setValue(event[0].name);
      this.field('size').setValue('');
    }
  }

  createItem() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const log = {
          message: `Added ${this.field('yardQty').value} items to Total Qty.`,
          user: this.user,
          date: new Date(),
          status: 'add',
        };
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/stockItems`, {
            ...this.form.value,
            log: [log],
          });
        this.masterSvc.notification().toast('Stock Item Added', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong adding stock item. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  updateItem() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.autoUpdate();
    });
  }

  addYardQty() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const total = +this.field('yardQty').value + this.addQty;
      this.field('yardQty').setValue(total);
      this.update();
      const log = {
        message: `Added ${this.addQty} items to Total Qty.`,
        user: this.user,
        date: new Date(),
        status: 'add',
        comment: this.comment,
      };
      if (this.inventoryItem.log) {
        this.inventoryItem.log.push(log);
      } else {
        this.inventoryItem.log = [log];
      }
      this.addQty = 0;
      this.autoUpdate();
    }, `Are you sure you want to add ${this.addQty} items?`);
  }

  moveToYard() {
    const inMaintenanceQty = +this.field('inMaintenanceQty').value;
    if (inMaintenanceQty < this.moveQty) {
      this.masterSvc
        .notification()
        .toast(
          'You cannot move more items than your In Maintenance Quantity',
          'danger',
          5000
        );
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.field('inMaintenanceQty').setValue(
          inMaintenanceQty - this.moveQty
        );
        this.update();
        const log = {
          message: `Moved ${this.moveQty} items from Maintenance to Available Qty.`,
          user: this.user,
          date: new Date(),
          status: 'move',
          comment: this.comment,
        };
        if (this.inventoryItem.log) {
          this.inventoryItem.log.push(log);
        } else {
          this.inventoryItem.log = [log];
        }
        this.moveQty = 0;
        this.autoUpdate();
      }, `Are you sure you want to move ${this.moveQty} items?`);
    }
  }

  moveTo(category: string, category2: string, field: string, moveQty: number) {
    const currentQty = +this.field(field).value;
    const yardQty = this.field('yardQty').value;
    const totalInUse =
      this.field('inUseQty').value +
      this.field('inMaintenanceQty').value +
      this.field('lostQty').value +
      this.field('damagedQty').value +
      this.field('reservedQty').value;
    const availableQty = yardQty - totalInUse;
    if (availableQty < moveQty) {
      this.masterSvc
        .notification()
        .toast(
          'You cannot move more items than your In Available Quantity',
          'danger',
          5000
        );
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.field(field).setValue(currentQty + moveQty);
        this.update();
        const log = {
          message: `Moved ${moveQty} items from ${category} to ${category2} Qty.`,
          user: this.user,
          date: new Date(),
          status: 'move',
          comment: this.comment,
        };
        if (this.inventoryItem.log) {
          this.inventoryItem.log.push(log);
        } else {
          this.inventoryItem.log = [log];
        }
        this.maintenanceQty = 0;
        this.damagedQty = 0;
        this.autoUpdate();
        this.comment = '';
      }, `Are you sure you want to move ${moveQty} items?`);
    }
  }

  removeYardQty() {
    const yardQty = this.field('yardQty').value;
    const totalInUse =
      this.field('inUseQty').value +
      this.field('inMaintenanceQty').value +
      this.field('lostQty').value +
      this.field('damagedQty').value +
      this.field('reservedQty').value;
    const availableQty = yardQty - totalInUse;
    if (availableQty < this.removeQty) {
      this.masterSvc
        .notification()
        .toast(
          'You cannot remove more items than your Available Quantity',
          'danger',
          5000
        );
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.field('yardQty').setValue(yardQty - this.removeQty);
        this.update();
        const log = {
          message: `Removed ${this.removeQty} items from Total Qty.`,
          user: this.user,
          date: new Date(),
          status: 'remove',
          comment: this.comment,
        };
        if (this.inventoryItem.log) {
          this.inventoryItem.log.push(log);
        } else {
          this.inventoryItem.log = [log];
        }
        this.removeQty = 0;
        this.autoUpdate();
      }, `Are you sure you want to remove ${this.removeQty} items?`);
    }
  }

  async repurpose() {
    const modal = await this.masterSvc.modal().create({
      component: RepurposeInventoryComponent,
      componentProps: {
        donarItem: this.inventoryItem,
      },
      cssClass: 'accept',
      showBackdrop: true,
      id: 'repurpose',
    });
    return await modal.present();
  }

  async uploaded(newFiles) {
    this.inventoryItem.uploads
      ? this.inventoryItem.uploads.push(...newFiles)
      : (this.inventoryItem.uploads = newFiles);
    this.autoUpdate();
  }

  private async autoUpdate() {
    this.loading = true;
    try {
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/stockItems`,
          this.inventoryItem.id,
          {
            ...this.inventoryItem,
            ...this.form.value,
            category:
              this.form.value.categoryType.name ||
              this.form.value.category ||
              '',
            log: this.inventoryItem.log,
          }
        );
      this.masterSvc.notification().toast('Stock Item Updated', 'success');
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating stock item. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      code: [this.inventoryItem.code, Validators.required],
      categoryType: [this.inventoryItem.categoryType || ''],
      category: [this.inventoryItem.category || ''],
      size: [this.inventoryItem.size || ''],
      location: [this.inventoryItem.location || ''],
      name: [this.inventoryItem.name, Validators.required],
      hireCost: [
        this.inventoryItem.hireCost,
        [Validators.required, Validators.min(0)],
      ],
      replacementCost: [
        this.inventoryItem.replacementCost,
        [Validators.required, Validators.min(0)],
      ],
      sellingCost: [
        this.inventoryItem.sellingCost,
        [Validators.required, Validators.min(0)],
      ],
      weight: [
        this.inventoryItem.weight,
        [Validators.required, Validators.min(0)],
      ],
      availableQty: [
        this.inventoryItem.availableQty,
        [Validators.required, Validators.min(0)],
      ],
      yardQty: [
        this.inventoryItem.yardQty,
        [Validators.required, Validators.min(0)],
      ],
      inUseQty: [this.inventoryItem.inUseQty, [Validators.min(0)]],
      inMaintenanceQty: [
        this.inventoryItem.inMaintenanceQty,
        [Validators.min(0)],
      ],
      damagedQty: [this.inventoryItem.damagedQty, [Validators.min(0)]],
      reservedQty: [this.inventoryItem?.reservedQty, [Validators.min(0)]],
      lostQty: [this.inventoryItem.lostQty, [Validators.min(0)]],
    });
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      code: ['', Validators.required],
      categoryType: [''],
      category: [''],
      size: [''],
      location: [''],
      name: ['', Validators.required],
      hireCost: [0, [Validators.required, Validators.min(0)]],
      replacementCost: [0, [Validators.required, Validators.min(0)]],
      sellingCost: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      availableQty: [0, [Validators.required, Validators.min(0)]],
      yardQty: [0, [Validators.required, Validators.min(0)]],
      inUseQty: [0, [Validators.min(0)]],
      reservedQty: [0, [Validators.min(0)]],
      inMaintenanceQty: [0, [Validators.min(0)]],
      damagedQty: [0, [Validators.min(0)]],
      lostQty: [0, [Validators.min(0)]],
    });
  }
}
