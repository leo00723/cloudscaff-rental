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
import { Observable, Subscription, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { User } from 'src/app/models/user.model';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { TransactionItem } from 'src/app/models/transactionItem.model';
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
      this.initEditForm();
    }
  }
  returnDoc: TransactionReturn = { status: 'submitted', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  items: TransactionItem[];
  itemBackup: TransactionItem[];
  sites$: Observable<Site[]>;
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
      this.init();
      this.initForm();
    }
  }

  changeSite(event) {
    this.field('site').setValue(event[0]);
  }
  createReturn() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const returnDoc: TransactionReturn = { ...this.form.value };
        this.itemBackup ||= [...this.items];
        returnDoc.items = this.itemBackup.filter((item) => item.returnQty > 0);
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
      Object.assign(this.returnDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
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
          this.returnDoc.signature2 = res.url2;
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

  protected async logCollection() {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      Object.assign(this.returnDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
        status: 'collected',
      });
      await this.upload();

      const res = await this.imgService.uploadBlob(
        this.blob,
        `company/${this.returnDoc.company.id}/shipments/${this.returnDoc.id}/signature`,
        ''
      );
      if (res) {
        this.returnDoc.signature = res.url2;
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
      poNumber: ['BulkReturn'],
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
      this.items = this.returnDoc.items;
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
      poNumber: ['BulkReturn'],
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
