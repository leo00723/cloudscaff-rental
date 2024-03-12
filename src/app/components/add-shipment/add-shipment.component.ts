import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { increment, orderBy, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';

@Component({
  selector: 'app-add-shipment',
  templateUrl: './add-shipment.component.html',
})
export class AddShipmentComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() inventoryItems$: Observable<InventoryItem[]>;
  @Input() set value(val: Shipment) {
    if (val) {
      Object.assign(this.shipment, val);
      this.initEditForm();
    }
  }
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  shipment: Shipment = { status: 'pending', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  searching = false;
  error = false;
  sites$: Observable<Site[]>;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.init();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    if (!this.isEdit) {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          this.items = items;
        })
      );
      this.initForm();
    }
  }

  update(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.shipmentQty = +val.detail.value;
      this.checkError(item);
    }
  }

  checkItem(args, item: InventoryItem) {
    item.checked = args.detail.checked;
  }

  checkError(item: InventoryItem) {
    // const totalQty = item.availableQty ? item.availableQty : 0;
    // const inUseQty = item.inUseQty ? item.inUseQty : 0;
    // const damaged = item.damagedQty ? item.damagedQty : 0;
    // const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    // const lost = item.lostQty ? item.lostQty : 0;
    // const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    // if (item.shipmentQty > availableQty || item.shipmentQty < 0) {
    //   item.error = true;
    //   this.error = true;
    // } else {
    //   item.error = false;
    //   this.error = false;
    // }
  }

  createShipment() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
        const shipment: Shipment = { ...this.form.value };

        shipment.items = this.itemBackup.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        shipment.code = `SHI${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalShipments ? this.company.totalShipments + 1 : 1)
          .toString()
          .padStart(6, '0')}`;
        shipment.date = new Date();
        await this.upload();
        shipment.uploads = this.shipment.uploads;
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/shipments`, shipment);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalShipments: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Shipment created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating shipment. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  updateShipment(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
        Object.assign(this.shipment, this.form.value);
        this.shipment.items = this.itemBackup.filter(
          (item) => item.shipmentQty > 0
        );
        this.shipment.status = status;
        this.shipment.date = new Date();
        await this.upload();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/shipments`,
            this.shipment.id,
            this.shipment
          );
        this.masterSvc
          .notification()
          .toast('Shipment updated successfully', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the shipment. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  changeSite(event) {
    this.field('site').setValue(event[0]);
  }

  autoSave() {
    if (this.isEdit) {
      if (this.shipment.status === 'pending') {
        this.autoUpdate();
      }
    } else {
      this.autoCreate();
    }
  }

  search(event) {
    this.searching = true;
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item?.code?.toString().toLowerCase().includes(val) ||
        item.name?.toLowerCase().includes(val) ||
        item?.category?.toLowerCase().includes(val) ||
        !val
    );
    if (!val) {
      this.searching = false;
    }
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.shipment.uploads.push(...newFiles);
  }

  async delete() {
    await this.masterSvc
      .edit()
      .deleteDocById(`company/${this.company.id}/shipments`, this.shipment.id);
    this.close();
  }

  async downloadPdf() {
    if (!this.shipment.date) {
      this.shipment.date = new Date();
    }
    const pdf = await this.masterSvc
      .pdf()
      .generateShipment(this.shipment, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.shipment.code);
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.shipment.site, Validators.required],
      startDate: [this.shipment.startDate, Validators.required],
      endDate: [this.shipment.endDate, Validators.required],
      company: [this.company, Validators.required],
      status: [this.shipment.status, Validators.required],
      updatedBy: [this.user.id, Validators.required],
    });
    if (this.shipment.status === 'pending') {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          items.forEach((dbItem) => {
            dbItem.shipmentQty = null;
          });
          this.shipment.items.forEach((item) => {
            const inventoryItem = items.find((i) => i.id === item.id);
            if (inventoryItem) {
              inventoryItem.shipmentQty = +item.shipmentQty;
              inventoryItem.checked = item.checked || false;
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.shipment.items;
    }
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      company: [this.company, Validators.required],
      status: ['pending', Validators.required],
      createdBy: [this.user.id, Validators.required],
    });
  }
  private init() {
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

  private async autoUpdate() {
    this.loading = true;
    try {
      this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
      Object.assign(this.shipment, this.form.value);
      this.shipment.items = this.itemBackup.filter(
        (item) => item.shipmentQty > 0
      );
      this.shipment.status = 'pending';
      await this.upload();

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/shipments`,
          this.shipment.id,
          this.shipment
        );

      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating the shipment. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }

  private async autoCreate() {
    this.loading = true;
    try {
      this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
      const shipment: Shipment = { ...this.form.value };
      shipment.items = this.itemBackup.filter((item) => item.shipmentQty > 0);
      this.company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);

      shipment.code = `SHI${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${(this.company.totalShipments ? this.company.totalShipments + 1 : 1)
        .toString()
        .padStart(6, '0')}`;
      await this.upload();
      shipment.uploads = this.shipment.uploads;
      const doc = await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/shipments`, shipment);

      this.shipment.id = doc.id;
      this.isEdit = true;
      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        totalShipments: increment(1),
      });

      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong creating shipment. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }
}
