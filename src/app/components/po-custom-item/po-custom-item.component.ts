import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { User } from 'src/app/models/user.model';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-po-custom-item',
  templateUrl: './po-custom-item.component.html',
})
export class PoCustomItemComponent implements OnInit {
  @Input() set value(val: EstimateV2) {
    if (val) {
      this.estimate = cloneDeep(val);
      this.initEditForm();
    }
  }
  @Output() update = new EventEmitter<EstimateV2>();

  estimate: EstimateV2;
  user: User;
  company: Company;
  form: FormGroup;
  loading = false;
  isLoading = true;
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private notificationService = inject(NotificationService);

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
  }
  ngOnInit() {}

  // START: FORM CRUD

  get itemForms() {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    const item = this.fb.group({
      code: ['', Validators.nullValidator],
      description: ['', Validators.nullValidator],
      note: ['', Validators.nullValidator],
      rate: [0, Validators.required],
      unit: [''],
      qty: [1, [Validators.required, Validators.min(1)]],
      duration: [1, [Validators.required]],
      total: [0],
      startDate: [''],
      endDate: [''],
      forInvoice: [false],
    });
    this.itemForms.push(item);
  }

  deleteItem(i: number) {
    this.notificationService.presentAlertConfirm(() => {
      this.itemForms.removeAt(i);
      this.emitData();
    });
  }

  // END: FORM CRUD

  protected updateTotal(i) {
    setTimeout(() => {
      const item = this.itemForms.controls[i];
      item
        .get('total')
        .setValue(
          +item.get('qty').value *
            +item.get('duration').value *
            +item.get('rate').value
        );
      this.emitData();
    }, 100);
  }

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.fb.group({
      items: this.fb.array([]),
    });

    this.estimate.items.forEach((a) => {
      const item = this.fb.group({
        code: [a.code || ''],
        description: [a.description || '', Validators.nullValidator],
        note: [a.note || '', Validators.nullValidator],
        rate: [a.rate || 0, Validators.required],
        unit: [a.unit || ''],
        qty: [a.qty || 1, [Validators.required, Validators.min(1)]],
        duration: [a.duration || 1, [Validators.required]],
        total: [a.total],
        startDate: [a.startDate || ''],
        endDate: [a.endDate || ''],
        forInvoice: [a.forInvoice || false],
      });
      this.itemForms.push(item);
    });
    this.isLoading = false;
  }

  emitData() {
    this.estimate.items = this.form.value.items;
    this.update.emit(this.estimate);
  }
  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  // END: Helper functions
}
