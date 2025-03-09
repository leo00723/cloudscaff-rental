import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { increment, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { Subscription, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { User } from 'src/app/models/user.model';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { orderBy } from 'firebase/firestore';
@Component({
  selector: 'app-add-adjustment',
  templateUrl: './add-adjustment.component.html',
})
export class AddAdjustmentComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() siteData: Site;
  @Input() set value(val: TransactionReturn) {
    if (val) {
      Object.assign(this.adjustmentDoc, val);
      this.initEditForm();
    }
  }
  adjustmentDoc: TransactionReturn = { status: 'pending', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  items: TransactionItem[];
  itemBackup: TransactionItem[];
  loading = false;
  viewAll = true;
  searching = false;
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
  ngOnInit() {
    if (!this.isEdit) {
      this.initForm();
    }
  }

  createAdjustment() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const adjustmentDoc: TransactionReturn = { ...this.form.value };
        this.itemBackup ||= [...this.items];
        adjustmentDoc.items = this.itemBackup.filter(
          (item) => item.returnQty > 0
        );
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        adjustmentDoc.code = this.masterSvc
          .edit()
          .generateDocCode(this.company.totalAdjustments, 'ADJ');
        await this.upload();
        adjustmentDoc.uploads = this.adjustmentDoc.uploads;
        adjustmentDoc.status = 'pending';
        const doc = await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/adjustments`, adjustmentDoc);
        adjustmentDoc.id = doc.id;
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalAdjustments: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Adjustment created successfully', 'success');
        this.adjustmentDoc = cloneDeep(adjustmentDoc);
        this.isEdit = true;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating adjustment. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }
  updateAdjustment(status: string, closeDoc?: boolean) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.adjustmentDoc, this.form.value);
        this.itemBackup ||= [...this.items];
        this.adjustmentDoc.items = this.itemBackup.filter(
          (item) => item.returnQty > 0
        );
        this.adjustmentDoc.status = status;
        await this.upload();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/adjustments`,
            this.adjustmentDoc.id,
            this.adjustmentDoc
          );

        this.masterSvc
          .notification()
          .toast('Adjustment updated successfully', 'success');
        if (closeDoc) {
          this.close();
        }
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating adjustment. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  protected getTransactions(value: any) {
    const poNumber = this.field('poNumber').value;
    if (!poNumber) {
      return;
    }
    this.subs.add(
      this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
          where('status', '==', 'active'),
          where('transactionType', '==', 'Delivery'),
          where('poNumber', '==', poNumber),
          orderBy('code', 'asc'),
        ])
        .pipe(take(1))
        .subscribe((data) => {
          this.items = data;
        })
    );
  }
  protected async approveAdjustment(isAdmin?: boolean) {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      Object.assign(this.adjustmentDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
        status: 'received',
      });
      await this.upload();

      if (!isAdmin) {
        const res = await this.imgService.uploadBlob(
          this.blob,
          `company/${this.adjustmentDoc.company.id}/shipments/${this.adjustmentDoc.id}/signature2`,
          ''
        );
        if (res) {
          this.adjustmentDoc.signature2 = res.url2;
          this.adjustmentDoc.signatureRef2 = res.ref;
        }
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/adjustments`,
          this.adjustmentDoc.id,
          this.adjustmentDoc
        );
      await this.downloadPdf();
      this.masterSvc
        .notification()
        .toast('Adjustment updated successfully', 'success');
      this.close();
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating adjustment. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }

  // protected async logCollection() {
  //   try {
  //     this.loading = true;
  //     this.itemBackup ||= [...this.items];
  //     Object.assign(this.adjustmentDoc, {
  //       ...this.form.value,
  //       items: this.itemBackup.filter((item) => item.returnQty > 0),
  //       status: 'collected',
  //     });
  //     await this.upload();

  //     const res = await this.imgService.uploadBlob(
  //       this.blob,
  //       `company/${this.adjustmentDoc.company.id}/shipments/${this.adjustmentDoc.id}/signature`,
  //       ''
  //     );
  //     if (res) {
  //       this.adjustmentDoc.signature = res.url2;
  //       this.adjustmentDoc.signatureRef = res.ref;
  //     }

  //     await this.masterSvc
  //       .edit()
  //       .updateDoc(
  //         `company/${this.company.id}/adjustments`,
  //         this.adjustmentDoc.id,
  //         this.adjustmentDoc
  //       );

  //     this.masterSvc
  //       .notification()
  //       .toast('Adjustment updated successfully', 'success');
  //     this.close();
  //   } catch (e) {
  //     console.error(e);
  //     this.masterSvc
  //       .notification()
  //       .toast(
  //         'Something went wrong updating adjustment. Please try again!',
  //         'danger'
  //       );
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  returnAll() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      for (const item of this.items) {
        item.returnQty = item.balanceQty;
      }
    }, 'Are you sure you want to return all items?');
  }

  async sign(ev: { signature: string; name: string }) {
    if (ev.signature) {
      this.blob = await (await fetch(ev.signature)).blob();
      if (this.adjustmentDoc.status === 'on-route') {
        this.adjustmentDoc.signedBy = ev.name;
      } else if (this.adjustmentDoc.status === 'collected') {
        this.adjustmentDoc.signedBy2 = ev.name;
      } else {
        this.adjustmentDoc.signedBy2 = ev.name;
      }
    } else {
      this.blob = null;
      return;
    }
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.adjustmentDoc.uploads.push(...newFiles);
  }

  async downloadPdf() {
    if (!this.adjustmentDoc.date) {
      this.adjustmentDoc.date = new Date();
    }
    const pdf = await this.masterSvc
      .pdf()
      .returnDoc(this.adjustmentDoc, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.adjustmentDoc.code);
  }
  async downloadPicklist() {
    if (this.isEdit) {
      if (!this.adjustmentDoc.date) {
        this.adjustmentDoc.date = new Date();
      }
      const pdf = await this.masterSvc
        .pdf()
        .returnPickList(this.adjustmentDoc, this.items, this.company);
      this.masterSvc
        .pdf()
        .handlePdf(pdf, `Picklist-${this.adjustmentDoc.code}`);
    } else {
      const adjustmentDoc: TransactionReturn = {
        ...this.form.value,
        code: 'N/A',
        date: new Date(),
      };
      const pdf = await this.masterSvc
        .pdf()
        .returnPickList(adjustmentDoc, this.items, this.company);
      this.masterSvc
        .pdf()
        .handlePdf(pdf, `Picklist-${adjustmentDoc.site.name}`);
    }
  }

  update(val, item: TransactionItem, type: string) {
    switch (type) {
      case 'returnQty':
        {
          item.returnQty = +val.detail.value;
        }
        break;
    }
    this.error = false;
    this.items.forEach((data) => {
      this.checkError(data);
      if (data.error) {
        this.error = true;
      }
    });
  }

  search(event) {
    this.searching = true;
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item?.code?.toString().toLowerCase().includes(val) ||
        item?.name?.toString().toLowerCase().includes(val) ||
        item?.category?.toString().toLowerCase().includes(val) ||
        item?.size?.toString().toLowerCase().includes(val) ||
        item?.location?.toString().toLowerCase().includes(val) ||
        !val
    );
    if (!val) {
      this.searching = false;
    }
  }

  checkError(item: TransactionItem): void {
    // Use nullish coalescing for cleaner default values
    const quantities = {
      damaged: item.damagedQty ?? 0,
      maintenance: item.inMaintenanceQty ?? 0,
      lost: item.lostQty ?? 0,
    };

    // Check if any quantity is negative
    const hasNegativeQuantity = Object.values(quantities).some(
      (qty) => qty < 0
    );

    // Calculate total affected items
    const totalAffectedItems = Object.values(quantities).reduce(
      (sum, qty) => sum + qty,
      0
    );

    // Combine all validation conditions
    const hasError =
      hasNegativeQuantity ||
      totalAffectedItems > item.returnQty ||
      item.returnQty > item.balanceQty ||
      item.returnQty < 0;

    // Update error states
    item.error = hasError;
  }
  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.adjustmentDoc.site, Validators.required],
      returnDate: [this.adjustmentDoc?.returnDate, Validators.required],
      notes: [this.adjustmentDoc?.notes, Validators.nullValidator],
      updatedBy: [this.user.id],
      status: [this.adjustmentDoc?.status, Validators.required],
      company: [this.company],
      date: [new Date()],
      driverName: [this.adjustmentDoc?.driverName, Validators.nullValidator],
      driverNo: [this.adjustmentDoc?.driverNo, Validators.nullValidator],
      vehicleReg: [this.adjustmentDoc?.vehicleReg, Validators.nullValidator],
      createdByName: [this.adjustmentDoc?.createdByName || ''],
      poNumber: [this.adjustmentDoc?.poNumber, Validators.required],
    });
    if (
      this.adjustmentDoc.status === 'submitted' ||
      this.adjustmentDoc.status === 'pending'
    ) {
      this.subs.add(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
            where('status', '==', 'active'),
            where('transactionType', '==', 'Delivery'),
            where('poNumber', '==', this.adjustmentDoc?.poNumber),
            orderBy('code', 'asc'),
          ])
          .subscribe((data) => {
            this.adjustmentDoc.items.forEach((item) => {
              const inventoryItem = data.find((i) => i.itemId === item.itemId);
              if (inventoryItem) {
                inventoryItem.returnQty = +item.returnQty;
                inventoryItem.inMaintenanceQty = +item.inMaintenanceQty;
                inventoryItem.damagedQty = +item.damagedQty;
                inventoryItem.lostQty = +item.lostQty;
              }
            });
            this.items = data;
          })
      );
    } else {
      this.items = this.adjustmentDoc.items;
    }
  }
  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.siteData, Validators.required],
      returnDate: [undefined, Validators.required],
      notes: ['', Validators.nullValidator],
      createdBy: [this.user.id],
      createdByName: [this.user.name],
      status: ['pending', Validators.required],
      company: [this.company],
      date: [new Date()],
      driverName: ['', Validators.nullValidator],
      driverNo: ['', Validators.nullValidator],
      vehicleReg: ['', Validators.nullValidator],
      poNumber: ['', Validators.required],
    });
  }
}
