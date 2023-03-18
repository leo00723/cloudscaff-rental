import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-stockitem',
  templateUrl: './add-stockitem.component.html',
  styles: [],
})
export class AddStockitemComponent implements OnInit {
  @Input() isEdit = false;
  @Input() set value(val: InventoryItem) {
    if (val) {
      Object.assign(this.inventoryItem, val);
      this.initEditForm();
    }
  }
  inventoryItem: InventoryItem = {};
  form: FormGroup;
  company: Company;
  user: User;
  loading = false;
  categories$: Observable<any>;
  removeQty = 0;
  addQty = 0;
  moveQty = 0;
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

  get crossHireForms() {
    return this.form.get('crossHire') as FormArray;
  }
  addCrossHire() {
    const crossHire = this.masterSvc.fb().group({
      company: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(0)]],
      date: ['', [Validators.required]],
      notes: [''],
    });
    this.crossHireForms.push(crossHire);
  }
  deleteCrossHire(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.crossHireForms.removeAt(i);
      this.update();
    });
  }

  //update the totals for a category
  update() {
    let crossHire = 0;
    this.crossHireForms.controls.forEach((c) => {
      crossHire += +c.get('qty').value;
    });
    const yard = +this.field('yardQty').value;
    this.field('crossHireQty').setValue(crossHire);
    this.field('availableQty').setValue(crossHire + yard);
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
      this.field('size').setValue('');
    }
  }

  createItem() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const log = {
          message: `${this.user.name} added ${
            this.field('yardQty').value
          } items to the yard.`,
          user: this.user,
          date: new Date(),
          status: 'add',
        };
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/stockItems`, {
            ...this.form.value,
            category: this.form.value.categoryType.name,
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
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/stockItems`,
            this.inventoryItem.id,
            {
              ...this.form.value,
              category: this.form.value.categoryType.name,
              log: this.inventoryItem.log,
            }
          );
        this.masterSvc.notification().toast('Stock Item Updated', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating stock item. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  addYardQty() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const total = +this.field('yardQty').value + this.addQty;
      this.field('yardQty').setValue(total);
      this.update();
      const log = {
        message: `${this.user.name} added ${this.addQty} items to the yard.`,
        user: this.user,
        date: new Date(),
        status: 'add',
      };
      if (this.inventoryItem.log) {
        this.inventoryItem.log.push(log);
      } else {
        this.inventoryItem.log = [log];
      }
      this.addQty = 0;
    }, `Are you sure you want to add ${this.addQty} items?`);
  }

  moveToYard() {
    const yardQty = +this.field('yardQty').value;
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
          message: `${this.user.name} moved ${this.moveQty} items to the yard.`,
          user: this.user,
          date: new Date(),
          status: 'move',
        };
        if (this.inventoryItem.log) {
          this.inventoryItem.log.push(log);
        } else {
          this.inventoryItem.log = [log];
        }
        this.moveQty = 0;
      }, `Are you sure you want to move ${this.moveQty} items?`);
    }
  }

  removeYardQty() {
    const yardQty = this.field('yardQty').value;
    const totalInUse =
      this.field('inUseQty').value +
      this.field('inMaintenanceQty').value +
      this.field('lostQty').value +
      this.field('damagedQty').value;
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
          message: `${this.user.name} removed ${this.removeQty} items from the yard.`,
          user: this.user,
          date: new Date(),
          status: 'remove',
        };
        if (this.inventoryItem.log) {
          this.inventoryItem.log.push(log);
        } else {
          this.inventoryItem.log = [log];
        }
        this.removeQty = 0;
      }, `Are you sure you want to remove ${this.removeQty} items?`);
    }
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      code: [this.inventoryItem.code, Validators.required],
      categoryType: [
        this.inventoryItem.categoryType ? this.inventoryItem.categoryType : '',
        Validators.required,
      ],
      size: [this.inventoryItem.size ? this.inventoryItem.size : ''],
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
      crossHireQty: [
        this.inventoryItem.crossHireQty,
        [Validators.required, Validators.min(0)],
      ],
      inUseQty: [
        this.inventoryItem.inUseQty,
        [Validators.required, Validators.min(0)],
      ],
      inMaintenanceQty: [
        this.inventoryItem.inMaintenanceQty,
        [Validators.required, Validators.min(0)],
      ],
      damagedQty: [
        this.inventoryItem.damagedQty,
        [Validators.required, Validators.min(0)],
      ],
      lostQty: [
        this.inventoryItem.lostQty,
        [Validators.required, Validators.min(0)],
      ],
      inService: [this.inventoryItem.inService, [Validators.required]],
      crossHire: this.masterSvc.fb().array(
        this.inventoryItem.crossHire.map((c) =>
          this.masterSvc.fb().group({
            company: [c.company, Validators.required],
            qty: [c.qty, [Validators.required, Validators.min(0)]],
            date: [c.date, [Validators.required]],
            notes: [c.notes],
          })
        )
      ),
    });
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      code: ['', Validators.required],
      categoryType: ['', Validators.required],
      size: [''],
      name: ['', Validators.required],
      hireCost: [0, [Validators.required, Validators.min(0)]],
      replacementCost: [0, [Validators.required, Validators.min(0)]],
      sellingCost: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      availableQty: [0, [Validators.required, Validators.min(0)]],
      yardQty: [0, [Validators.required, Validators.min(0)]],
      crossHireQty: [0, [Validators.required, Validators.min(0)]],
      inUseQty: [0, [Validators.required, Validators.min(0)]],
      reservedQty: [0, [Validators.required, Validators.min(0)]],
      inMaintenanceQty: [0, [Validators.required, Validators.min(0)]],
      damagedQty: [0, [Validators.required, Validators.min(0)]],
      lostQty: [0, [Validators.required, Validators.min(0)]],
      inService: [true, [Validators.required]],
      crossHire: this.masterSvc.fb().array([]),
    });
  }
}
