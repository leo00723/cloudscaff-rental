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
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Return } from 'src/app/models/return.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { ImgService } from 'src/app/services/img.service';

@Component({
  selector: 'app-add-admin-return',
  templateUrl: './add-admin-return.component.html',
})
export class AddAdminReturnComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() allowSend = true;
  @Input() set value(val: Return) {
    if (val) {
      Object.assign(this.returnDoc, val);
      this.initEditForm();
    }
  }
  returnDoc: Return = { status: 'submitted', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  items: InventoryItem[];
  itemBackup: InventoryItem[];
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

  createReturn() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const returnDoc: Return = { ...this.form.value };
        this.itemBackup ||= [...this.items];
        returnDoc.items = this.itemBackup.filter(
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
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/returns`, returnDoc);

        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalReturns: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Return created successfully', 'success');
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
  updateReturn(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.returnDoc, this.form.value);
        this.itemBackup ||= [...this.items];
        this.returnDoc.items = this.itemBackup.filter(
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

  protected async approveReturn() {
    try {
      this.loading = true;
      this.itemBackup ||= [...this.items];
      Object.assign(this.returnDoc, {
        ...this.form.value,
        items: this.itemBackup.filter((item) => item.shipmentQty > 0),
        status: 'received',
      });
      await this.upload();

      const res = await this.imgService.uploadBlob(
        this.blob,
        `company/${this.returnDoc.company.id}/shipments/${this.returnDoc.id}/signature2`,
        ''
      );
      if (res) {
        this.returnDoc.signature2 = res.url2;
        this.returnDoc.signatureRef2 = res.ref;
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
        items: this.itemBackup.filter((item) => item.shipmentQty > 0),
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
        item.shipmentQty = item.availableQty;
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
      .generateReturn(this.returnDoc, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.returnDoc.code);
  }
  async downloadPicklist() {
    if (this.isEdit) {
      if (!this.returnDoc.date) {
        this.returnDoc.date = new Date();
      }
      const pdf = await this.masterSvc
        .pdf()
        .generateReturnPickList(this.returnDoc, this.items, this.company);
      this.masterSvc.pdf().handlePdf(pdf, `Picklist-${this.returnDoc.code}`);
    } else {
      const returnDoc: Return = {
        ...this.form.value,
        code: 'N/A',
        date: new Date(),
      };
      const pdf = await this.masterSvc
        .pdf()
        .generateReturnPickList(returnDoc, this.items, this.company);
      this.masterSvc.pdf().handlePdf(pdf, `Picklist-${returnDoc.site.name}`);
    }
  }

  updateItems() {
    const site = this.field('site').value.id;
    this.subs.add(
      this.masterSvc
        .edit()
        .getDocById(`company/${this.company.id}/siteStock`, site)
        .subscribe((data) => {
          this.items = data.items;
        })
    );
  }
  update(val, item: InventoryItem, type: string) {
    switch (type) {
      case 'shipment':
        {
          item.shipmentQty = +val.detail.value;
          item.shipmentQty > item.availableQty || item.shipmentQty < 0
            ? (this.error = true)
            : (this.error = false);
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
    this.checkError(item);
  }

  search(event) {
    console.log('searching');
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

  checkError(item: InventoryItem) {
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    if (
      damaged + maintenance + lost > item.shipmentQty ||
      damaged < 0 ||
      maintenance < 0 ||
      lost < 0
    ) {
      item.error = true;
      this.error = true;
    } else {
      item.error = false;
      this.error = false;
    }
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
    });
    if (this.returnDoc.status === 'submitted') {
      this.subs.add(
        this.masterSvc
          .edit()
          .getDocById(
            `company/${this.company.id}/siteStock`,
            this.returnDoc.site.id
          )
          .subscribe((data) => {
            this.returnDoc.items.forEach((item) => {
              const inventoryItem = data.items.find((i) => i.id === item.id);
              if (inventoryItem) {
                inventoryItem.shipmentQty = +item.shipmentQty;
              }
            });
            this.items = data.items;
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
