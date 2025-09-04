import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { increment, orderBy, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { lastValueFrom, map, Observable, Subscription, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Site } from 'src/app/models/site.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { User } from 'src/app/models/user.model';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
@Component({
  selector: 'app-transaction-return',
  templateUrl: './transaction-return.component.html',
})
export class TransactionReturnComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: TransactionReturn) {
    if (val) {
      Object.assign(this.returnDoc, val);
    }
  }
  @Input() inventoryItems$: Observable<InventoryItem[]>;

  returnDoc: TransactionReturn = {
    status: 'submitted',
    uploads: [],
    overageItems: [],
  };

  form: FormGroup;
  user: User;
  company: Company;

  items: TransactionItem[];
  itemBackup: TransactionItem[];

  overageItems: InventoryItem[];
  overageBackupItems: InventoryItem[];

  sites$: Observable<Site[]>;
  loading = false;

  viewAll = true;
  searching = false;

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
    if (!this.isEdit) {
      this.overageItems = await lastValueFrom(
        this.inventoryItems$.pipe(
          map((items) => {
            items.forEach((item) => {
              item.shipmentQty = null;
            });
            return items;
          })
        )
      );
      this.init();
      this.initForm();
    } else {
      this.initEditForm();
    }
  }

  changeSite(event) {
    this.field('site').setValue(event[0]);
    this.getTransactions();
  }

  createReturn() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const returnDoc: TransactionReturn = { ...this.form.value };
        this.itemBackup ||= [...this.items];
        returnDoc.items = this.itemBackup.filter((item) => item.returnQty > 0);

        this.overageBackupItems ||= [...this.overageItems];
        returnDoc.overageItems = this.overageBackupItems.filter(
          (item) => item.shipmentQty > 0
        );

        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        returnDoc.code = this.masterSvc
          .edit()
          .generateDocCode(this.company.totalReturns, 'RET');
        await this.upload();
        returnDoc.uploads = this.returnDoc.uploads;
        returnDoc.status = 'submitted';
        const doc = await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/returns`, returnDoc);
        returnDoc.id = doc.id;
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalReturns: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Return created successfully', 'success');
        this.returnDoc = cloneDeep(returnDoc);
        this.isEdit = true;
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
    });
  }

  updateReturn(status: string, closeDoc?: boolean) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.returnDoc, this.form.value);

        this.itemBackup ||= [...this.items];
        this.returnDoc.items = this.itemBackup.filter(
          (item) => item.returnQty > 0
        );

        this.overageBackupItems ||= [...this.overageItems];
        this.returnDoc.overageItems = this.overageBackupItems.filter(
          (item) => item.shipmentQty > 0
        );

        this.returnDoc.status = status;
        await this.upload();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/returns`,
            this.returnDoc.id,
            this.returnDoc
          );

        this.masterSvc
          .notification()
          .toast('Return updated successfully', 'success');
        if (closeDoc) {
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
    });
  }

  protected getTransactions() {
    this.subs.add(
      this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
          where('status', '==', 'active'),
          where('transactionType', '==', 'Delivery'),
          where('siteId', '==', this.field('site').value.id),
          orderBy('code', 'asc'),
        ])
        .pipe(take(1))
        .subscribe((data) => {
          this.items = data;
        })
    );
  }

  protected async approveReturn(isAdmin?: boolean) {
    try {
      this.loading = true;

      this.itemBackup ||= [...this.items];
      this.overageBackupItems ||= [...this.overageItems];

      Object.assign(this.returnDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
        overageItems: this.overageBackupItems.filter(
          (item) => item.shipmentQty > 0
        ),
        status: 'received',
      });

      await this.upload();

      if (!isAdmin) {
        const res = await this.imgService.uploadBlob(
          this.blob,
          `company/${this.returnDoc.company.id}/shipments/${this.returnDoc.id}/signature2`,
          ''
        );
        if (res) {
          this.returnDoc.signature2 = res.url;
          this.returnDoc.signatureRef2 = res.ref;
        }
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/returns`,
          this.returnDoc.id,
          this.returnDoc
        );

      if (this.returnDoc.overageItems.length > 0) {
        await this.createOverReturn();
      }
      await this.downloadPdf();
      this.masterSvc
        .notification()
        .toast('Return updated successfully', 'success');
      this.close();
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

  async createOverReturn() {
    const overReturn = cloneDeep(this.returnDoc);
    delete overReturn.id;
    delete overReturn.items;

    overReturn.code = this.masterSvc
      .edit()
      .generateDocCode(this.company.totalOverReturns, 'OR');
    overReturn.status = 'open';
    overReturn.overageItems.map((item) => ({
      ...item,
      overageBalanceQty: item.shipmentQty,
    }));

    const doc = await this.masterSvc
      .edit()
      .addDocument(`company/${this.company.id}/overReturns`, overReturn);

    await this.masterSvc.edit().updateDoc('company', this.company.id, {
      totalOverReturns: increment(1),
    });
  }

  protected async logCollection() {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      this.overageBackupItems ||= [...this.overageItems];

      Object.assign(this.returnDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
        overageItems: this.overageBackupItems.filter(
          (item) => item.shipmentQty > 0
        ),
        status: 'collected',
      });
      await this.upload();

      const res = await this.imgService.uploadBlob(
        this.blob,
        `company/${this.returnDoc.company.id}/shipments/${this.returnDoc.id}/signature`,
        ''
      );
      if (res) {
        this.returnDoc.signature = res.url;
        this.returnDoc.signatureRef = res.ref;
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/returns`,
          this.returnDoc.id,
          this.returnDoc
        );

      this.masterSvc
        .notification()
        .toast('Return updated successfully', 'success');
      this.close();
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
      if (this.returnDoc.status === 'on-route') {
        this.returnDoc.signedBy = ev.name;
      } else if (this.returnDoc.status === 'collected') {
        this.returnDoc.signedBy2 = ev.name;
      } else {
        this.returnDoc.signedBy2 = ev.name;
      }
    } else {
      this.blob = null;
      return;
    }
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.returnDoc.uploads.push(...newFiles);
  }

  delete() {
    // this.masterSvc.notification().presentAlertConfirm(async () => {
    //   await this.masterSvc
    //     .edit()
    //     .deleteDocById(
    //       `company/${this.company.id}/returns`,
    //       this.returnDoc.id
    //     );
    //   this.close();
    // });
  }

  async downloadPdf() {
    if (!this.returnDoc.date) {
      this.returnDoc.date = new Date();
    }

    const pdf = await this.masterSvc
      .pdf()
      .returnDoc(this.returnDoc, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.returnDoc.code);
  }

  async downloadPicklist() {
    if (this.isEdit) {
      if (!this.returnDoc.date) {
        this.returnDoc.date = new Date();
      }
      const pdf = await this.masterSvc
        .pdf()
        .returnPickList(this.returnDoc, this.items, this.company);
      this.masterSvc.pdf().handlePdf(pdf, `Picklist-${this.returnDoc.code}`);
    } else {
      const returnDoc: TransactionReturn = {
        ...this.form.value,
        code: 'N/A',
        date: new Date(),
      };
      const pdf = await this.masterSvc
        .pdf()
        .returnPickList(returnDoc, this.items, this.company);
      this.masterSvc.pdf().handlePdf(pdf, `Picklist-${returnDoc.site.name}`);
    }
  }

  update(val, item: TransactionItem, type: string) {
    switch (type) {
      case 'returnQty':
        {
          item.returnQty = +val.detail.value;
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
    this.error = false;
    this.items.forEach((data) => {
      this.checkError(data);
      if (data.error) {
        this.error = true;
      }
    });
  }

  updateOverages(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.shipmentQty = +val.detail.value;
    }
  }

  search(event) {
    this.searching = true;
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup ||= [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item?.code?.toString().toLowerCase().includes(val) ||
        item?.jobReference?.toString().toLowerCase() === val ||
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
  private async initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.returnDoc.site, Validators.required],
      returnDate: [this.returnDoc?.returnDate, Validators.required],
      notes: [this.returnDoc?.notes, Validators.nullValidator],
      updatedBy: [this.user.id],
      status: [this.returnDoc?.status, Validators.required],
      company: [this.company],
      date: [new Date()],
      driverName: [this.returnDoc?.driverName, Validators.nullValidator],
      driverNo: [this.returnDoc?.driverNo, Validators.nullValidator],
      vehicleReg: [this.returnDoc?.vehicleReg, Validators.nullValidator],
      createdByName: [this.returnDoc?.createdByName || ''],
      jobReference: ['BulkReturn'],
    });
    if (this.returnDoc.status === 'submitted') {
      this.subs.add(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
            where('status', '==', 'active'),
            where('transactionType', '==', 'Delivery'),
            where('siteId', '==', this.returnDoc.site.id),
            orderBy('code', 'asc'),
          ])
          .subscribe((data) => {
            this.returnDoc.items.forEach((item) => {
              const inventoryItem = data.find((i) => i.id === item.id);
              if (inventoryItem) {
                inventoryItem.returnQty = +item.returnQty || null;
                inventoryItem.inMaintenanceQty = +item.inMaintenanceQty || null;
                inventoryItem.damagedQty = +item.damagedQty || null;
                inventoryItem.lostQty = +item.lostQty || null;
              }
            });
            this.items = data;
          })
      );
      this.overageItems = await lastValueFrom(
        this.inventoryItems$.pipe(
          map((items) => {
            items.forEach((item) => {
              item.shipmentQty = null;
            });
            return items;
          })
        )
      );
      this.returnDoc.overageItems.forEach((item) => {
        const inventoryItem = this.overageItems.find((i) => i.id === item.id);
        if (inventoryItem) {
          inventoryItem.shipmentQty = +item.shipmentQty;
        }
      });
    } else {
      this.items = this.returnDoc.items;
      this.overageItems = this.returnDoc.overageItems;
    }
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: ['', Validators.required],
      returnDate: [undefined, Validators.required],
      notes: ['', Validators.nullValidator],
      createdBy: [this.user.id],
      createdByName: [this.user.name],
      status: ['submitted', Validators.required],
      company: [this.company],
      date: [new Date()],
      driverName: ['', Validators.nullValidator],
      driverNo: ['', Validators.nullValidator],
      vehicleReg: ['', Validators.nullValidator],
      jobReference: ['BulkReturn'],
    });
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.sites$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/sites`, [
            where('status', '==', 'active'),
            orderBy('code', 'desc'),
          ]);
      } else {
        this.masterSvc.log(
          '-----------------------try sites----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
