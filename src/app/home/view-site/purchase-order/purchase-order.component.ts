import { Component, inject, Input, OnInit } from '@angular/core';
import { where } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { PO } from 'src/app/models/po.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
})
export class PurchaseOrderComponent implements OnInit {
  @Input() set value(val: PO) {
    if (val) {
      Object.assign(this.po, val);
      this.init();
    }
  }
  @Input() site: Site;

  protected po: PO = {};
  protected user: User;
  protected company: Company;
  protected form: FormGroup;

  protected deliveries$: Observable<Shipment[]>;

  private modalSvc = inject(ModalController);
  private editSvc = inject(EditService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.form = this.fb.group({
      endDate: ['', Validators.required],
      days: [0],
      months: [0],
    });
  }

  ngOnInit(): void {}

  close() {
    this.modalSvc.dismiss();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  updateDate() {
    this.field('endDate').value;
  }

  updateRate(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.hireCost = +val.detail.value;
    }
  }

  private init() {
    this.po.poNumber;
    this.deliveries$ = this.editSvc
      .getCollectionFiltered(`company/${this.company.id}/shipments`, [
        where('poNumber', '==', this.po.poNumber),
      ])
      .pipe(take(1));
  }
}
