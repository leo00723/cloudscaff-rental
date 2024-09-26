import { Component, inject, Input, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
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
import { PO } from 'src/app/models/po.model';
import { Site } from 'src/app/models/site.model';
import { TransactionItem } from 'src/app/models/TransactionItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styles: [],
})
export class PurchaseOrderComponent implements OnInit {
  @Input() set value(val: PO) {
    if (val) {
      Object.assign(this.po, val);
      this.init();
    }
  }
  @Input() site: Site;

  protected saving = false;

  protected company: Company;
  protected form: FormGroup;
  protected po: PO = {};
  protected user: User;

  protected transactions$: Observable<TransactionItem[]>;

  private editSvc = inject(EditService);
  private fb = inject(FormBuilder);
  private modalSvc = inject(ModalController);
  private notificationSvc = inject(NotificationService);
  private store = inject(Store);

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

  async updateRate(val, item: TransactionItem) {
    if (isNaN(+val.detail.target.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.hireRate = +val.detail.target.value;
      try {
        this.saving = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/transactionLog`,
          item.id,
          {
            hireRate: item.hireRate,
          }
        );
      } catch (e) {
        console.log(e);
        this.notificationSvc.toast(
          'Something went wrong saving rate, please try again',
          'danger'
        );
      } finally {
        this.saving = false;
      }
    }
  }

  private init() {
    this.po.poNumber;
    this.transactions$ = this.editSvc
      .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
        where('poNumber', '==', this.po.poNumber),
        where('status', '==', 'active'),
        orderBy('transactionType', 'asc'),
        orderBy('invoiceStart', 'asc'),
        orderBy('code', 'asc'),
      ])
      .pipe(take(1));
  }
}
