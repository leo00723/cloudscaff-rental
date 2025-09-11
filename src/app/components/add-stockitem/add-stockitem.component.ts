import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { RepurposeInventoryComponent } from '../repurpose-inventory/repurpose-inventory.component';

@Component({
  selector: 'app-add-stockitem',
  templateUrl: './add-stockitem.component.html',
  styles: [],
})
export class AddStockitemComponent implements OnInit {
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
    // availableQty is now calculated, no need to set it
  }

  close() {
    this.masterSvc.modal().dismiss();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  // Handle movement completed from child component
  onMovementCompleted(updatedItem: InventoryItem) {
    this.inventoryItem = { ...updatedItem };
    // Update the form fields with the new quantities
    this.field('inMaintenanceQty').setValue(updatedItem.inMaintenanceQty || 0);
    this.field('damagedQty').setValue(updatedItem.damagedQty || 0);
    this.field('lostQty').setValue(updatedItem.lostQty || 0);
    this.field('resizedQty').setValue(updatedItem.resizedQty || 0);
    this.field('yardQty').setValue(updatedItem.yardQty || 0);

    this.autoUpdate();
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

        // Map form values to InventoryItem
        const item: InventoryItem = {
          code: this.form.get('code').value,
          category: this.form.get('category').value,
          size: this.form.get('size').value,
          name: this.form.get('name').value,
          location: this.form.get('location').value,
          hireCost: +this.form.get('hireCost').value,
          replacementCost: +this.form.get('replacementCost').value,
          sellingCost: +this.form.get('sellingCost').value,
          weight: +this.form.get('weight').value,
          yardQty: +this.form.get('yardQty').value,
          inUseQty: +this.form.get('inUseQty').value,
          reservedQty: +this.form.get('reservedQty').value,
          inMaintenanceQty: +this.form.get('inMaintenanceQty').value,
          damagedQty: +this.form.get('damagedQty').value,
          lostQty: +this.form.get('lostQty').value,
          resizedQty: +this.form.get('resizedQty').value,
          lowPercentage: +this.form.get('lowPercentage').value,
          type: this.form.get('type').value,
          supplier: this.form.get('supplier').value,
          storageType: this.form.get('storageType').value,
          storageQty: this.form.get('storageQty').value,
          log: [log],
        };
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/stockItems`, item);
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

  private async autoUpdate() {
    this.loading = true;
    try {
      // Map form values to InventoryItem
      const item: InventoryItem = {
        code: this.form.get('code').value,
        size: this.form.get('size').value,
        name: this.form.get('name').value,
        location: this.form.get('location').value,
        hireCost: +this.form.get('hireCost').value,
        replacementCost: +this.form.get('replacementCost').value,
        sellingCost: +this.form.get('sellingCost').value,
        weight: +this.form.get('weight').value,
        yardQty: +this.form.get('yardQty').value,
        inUseQty: +this.form.get('inUseQty').value,
        reservedQty: +this.form.get('reservedQty').value,
        inMaintenanceQty: +this.form.get('inMaintenanceQty').value,
        damagedQty: +this.form.get('damagedQty').value,
        lostQty: +this.form.get('lostQty').value,
        resizedQty: +this.form.get('resizedQty').value,
        lowPercentage: +this.form.get('lowPercentage').value,
        category:
          this.form.value.categoryType.name || this.form.value.category || '',
        type: this.form.get('type').value,
        supplier: this.form.get('supplier').value,
        log: this.inventoryItem.log,
      };
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/stockItems`,
          this.inventoryItem.id,
          item
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
      resizedQty: [this.inventoryItem.resizedQty, [Validators.min(0)]],
      lowPercentage: [
        this.inventoryItem?.lowPercentage || 0,
        [Validators.min(0), Validators.max(100)],
      ],
      type: [this.inventoryItem?.type || ''],
      supplier: [this.inventoryItem?.supplier || ''],
      storageType: [this.inventoryItem?.storageType || ''],
      storageQty: [this.inventoryItem?.storageQty || ''],
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
      yardQty: [0, [Validators.required, Validators.min(0)]],
      inUseQty: [0, [Validators.min(0)]],
      reservedQty: [0, [Validators.min(0)]],
      inMaintenanceQty: [0, [Validators.min(0)]],
      damagedQty: [0, [Validators.min(0)]],
      lostQty: [0, [Validators.min(0)]],
      resizedQty: [0, [Validators.min(0)]],
      lowPercentage: [0, [Validators.min(0), Validators.max(100)]],
      type: [''],
      supplier: [''],
    });
  }
}
