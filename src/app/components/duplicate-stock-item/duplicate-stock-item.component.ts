import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
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
  selector: 'app-duplicate-stock-item',
  templateUrl: './duplicate-stock-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuplicateStockItemComponent implements OnInit {
  @Input() set value(val: InventoryItem) {
    if (val) {
      Object.assign(this.inventoryItem, val);
      this.initEditForm();
    }
  }
  inventoryItem: InventoryItem = {};
  form: FormGroup;
  categories = [
    'Base Plates',
    'Braces',
    'Couplers',
    'Decks',
    'Ladders',
    'Ledgers',
    'Standards',
    'Ties',
    'Toe Boards',
    'Transoms',
    'Tubes',
  ];
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

  ngOnInit(): void {}

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

  createItem() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/stockItems`, {
            ...this.form.value,
            category: this.form.value.categoryType.name,
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
}
