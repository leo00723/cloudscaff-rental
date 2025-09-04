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
  selector: 'app-transaction-adjustment',
  templateUrl: './transaction-adjustment.component.html',
})
export class TransactionAdjustmentComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: TransactionReturn) {
    if (val) {
      Object.assign(this.adjustmentDoc, val);
      this.initEditForm();
    }
  }
  adjustmentDoc: TransactionReturn = { status: 'submitted', uploads: [] };
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
          .generateDocCode(this.company.totalAdjustments, 'ADJ');
        await this.upload();
        returnDoc.uploads = this.adjustmentDoc.uploads;
        returnDoc.status = 'submitted';
        const doc = await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/adjustments`, returnDoc);
        returnDoc.id = doc.id;
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalAdjustments: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Return created successfully', 'success');
        this.adjustmentDoc = cloneDeep(returnDoc);
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
            `company/${this.company.id}/adjustmentss`,
            this.adjustmentDoc.id,
            this.adjustmentDoc
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

  protected getTransactions(value: any) {
    const jobReference = this.field('jobReference').value;
    if (!jobReference) {
      return;
    }
    this.subs.add(
      this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
          where('status', '==', 'active'),
          where('transactionType', '==', 'Delivery'),
          where('jobReference', '==', jobReference),
          where('siteId', '==', this.field('site').value.id),
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
          this.adjustmentDoc.signature2 = res.url;
          this.adjustmentDoc.signatureRef2 = res.ref;
        }
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/adjustmentss`,
          this.adjustmentDoc.id,
          this.adjustmentDoc
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
      Object.assign(this.adjustmentDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.returnQty > 0),
        status: 'collected',
      });
      await this.upload();

      const res = await this.imgService.uploadBlob(
        this.blob,
        `company/${this.adjustmentDoc.company.id}/shipments/${this.adjustmentDoc.id}/signature`,
        ''
      );
      if (res) {
        this.adjustmentDoc.signature = res.url;
        this.adjustmentDoc.signatureRef = res.ref;
      }

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/adjustmentss`,
          this.adjustmentDoc.id,
          this.adjustmentDoc
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

  delete() {
    // this.masterSvc.notification().presentAlertConfirm(async () => {
    //   await this.masterSvc
    //     .edit()
    //     .deleteDocById(
    //       `company/${this.company.id}/adjustmentss`,
    //       this.returnDoc.id
    //     );
    //   this.close();
    // });
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
      jobReference: [this.adjustmentDoc?.jobReference, Validators.required],
    });
    if (this.adjustmentDoc.status === 'submitted') {
      this.subs.add(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
            where('status', '==', 'active'),
            where('transactionType', '==', 'Delivery'),
            where('jobReference', '==', this.adjustmentDoc?.jobReference),
            where('siteId', '==', this.adjustmentDoc?.site.id),
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
      jobReference: ['', Validators.required],
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
