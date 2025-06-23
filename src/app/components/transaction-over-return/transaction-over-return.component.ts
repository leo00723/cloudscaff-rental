import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { User } from 'src/app/models/user.model';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
@Component({
  selector: 'app-transaction-over-return',
  templateUrl: './transaction-over-return.component.html',
})
export class TransactionOverReturnComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: TransactionReturn) {
    if (val) {
      const data = cloneDeep(val);
      Object.assign(this.overReturn, data);
    }
  }
  @Input() inventoryItems$: Observable<InventoryItem[]>;

  overReturn: TransactionReturn = {
    status: 'submitted',
    uploads: [],
    overageItems: [],
  };

  form: FormGroup;
  user: User;
  company: Company;

  overageItems: InventoryItem[];
  overageBackupItems: InventoryItem[];

  loading = false;

  viewAllOverages = true;
  searchingOverages = false;

  error = false;

  blob: any;

  private imgService = inject(ImgService);
  private subs = new Subscription();

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async ngOnInit() {
    this.initEditForm();
  }

  updateReversal(status: string, closeDoc?: boolean) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.overReturn, this.form.value);

        this.overageBackupItems ||= [...this.overageItems];
        this.overReturn.overageItems = this.overageBackupItems;

        this.overReturn.status = status;
        await this.upload();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/overReturns`,
            this.overReturn.id,
            this.overReturn
          );

        this.masterSvc
          .notification()
          .toast('Over Return updated successfully', 'success');
        if (closeDoc) {
          this.close();
        }
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating over return. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  deleteReversal(closeDoc?: boolean) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .deleteDocById(
            `company/${this.company.id}/overReturns`,
            this.overReturn.id
          );

        this.masterSvc
          .notification()
          .toast('Over Return deleted successfully', 'success');
        if (closeDoc) {
          this.close();
        }
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong deleting over return. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  protected async approveReversal(isAdmin?: boolean) {
    try {
      this.loading = true;

      this.overageBackupItems ||= [...this.overageItems];

      Object.assign(this.overReturn, {
        ...this.form.value,
        overageItems: this.overageBackupItems.filter(
          (item) => item.returnQty > 0
        ),
        status: 'reversed',
      });

      await this.upload();

      if (!isAdmin) {
        const res = await this.imgService.uploadBlob(
          this.blob,
          `company/${this.overReturn.company.id}/overReturns/${this.overReturn.id}/signature2`,
          ''
        );
        if (res) {
          this.overReturn.signature2 = res.url2;
          this.overReturn.signatureRef2 = res.ref;
        }
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/overReturns`,
          this.overReturn.id,
          this.overReturn
        );

      await this.downloadPdf();
      this.masterSvc
        .notification()
        .toast('Over Return updated successfully', 'success');
      this.close();
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating over return. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }

  async createReversal() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.updateTotals();
        const overReturn = cloneDeep({
          ...this.overReturn,
          code: `${this.overReturn.code}-R`,
          overageItems: this.overageItems,
          parentId: this.overReturn.id,
          isReversal: true,
          createdBy: this.user.id,
          createdByName: this.user.name,
          returnDate: new Date().toISOString(),
          status: 'reversed',
        });
        delete overReturn.id;

        const doc = await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/overReturns`, overReturn);

        this.close();
        this.masterSvc
          .notification()
          .toast('Over Return created successfully', 'success');
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating over return. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  async sign(ev: { signature: string; name: string }) {
    if (ev.signature) {
      this.blob = await (await fetch(ev.signature)).blob();
      if (this.overReturn.status === 'on-route') {
        this.overReturn.signedBy = ev.name;
      } else if (this.overReturn.status === 'collected') {
        this.overReturn.signedBy2 = ev.name;
      } else {
        this.overReturn.signedBy2 = ev.name;
      }
    } else {
      this.blob = null;
      return;
    }
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.overReturn.uploads.push(...newFiles);
  }

  async downloadPdf() {
    if (!this.overReturn.date) {
      this.overReturn.date = new Date();
    }

    const pdf = await this.masterSvc
      .pdf()
      .returnDoc(this.overReturn, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.overReturn.code);
  }

  updateOverages(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.returnQty = +val.detail.value;
      item.error =
        +item.shipmentQty < (+item.reversedQty || 0) + +item.returnQty
          ? true
          : false;
      this.error = this.overageItems.some((data) => data.error);
    }
  }

  searchOverages(event) {
    this.searchingOverages = true;
    const val = event.detail.value.toLowerCase() as string;
    this.overageBackupItems = this.overageBackupItems
      ? this.overageBackupItems
      : [...this.overageItems];
    this.overageItems = this.overageBackupItems.filter(
      (item) =>
        item?.code?.toString().toLowerCase().includes(val) ||
        item?.name?.toString().toLowerCase().includes(val) ||
        item?.category?.toString().toLowerCase().includes(val) ||
        item?.size?.toString().toLowerCase().includes(val) ||
        item?.location?.toString().toLowerCase().includes(val) ||
        !val
    );
    if (!val) {
      this.searchingOverages = false;
    }
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  private async updateTotals() {
    this.overReturn.overageItems.forEach((item) => {
      if (item.returnQty > 0) {
        item.reversedQty = (+item.reversedQty || 0) + (+item.returnQty || 0);
      }
    });
    await this.masterSvc
      .edit()
      .updateDoc(
        `company/${this.company.id}/overReturns`,
        this.overReturn.id,
        this.overReturn
      );
  }
  private async initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.overReturn.site, Validators.required],
      returnDate: [this.overReturn?.returnDate, Validators.required],
      notes: [this.overReturn?.notes, Validators.nullValidator],
      updatedBy: [this.user.id],
      status: [this.overReturn?.status, Validators.required],
      company: [this.company],
      date: [new Date()],
      driverName: [this.overReturn?.driverName, Validators.nullValidator],
      driverNo: [this.overReturn?.driverNo, Validators.nullValidator],
      vehicleReg: [this.overReturn?.vehicleReg, Validators.nullValidator],
      createdByName: [this.overReturn?.createdByName || ''],
      poNumber: ['BulkReturn'],
    });

    this.overageItems = this.overReturn.overageItems;
  }
}
