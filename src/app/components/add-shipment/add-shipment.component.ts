import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { increment, orderBy, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Delivery } from 'src/app/models/delivery.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { ImgService } from 'src/app/services/img.service';
import * as Papa from 'papaparse';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-add-shipment',
  templateUrl: './add-shipment.component.html',
})
export class AddShipmentComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() inventoryItems$: Observable<InventoryItem[]>;
  @Input() set value(val: Delivery) {
    if (val) {
      Object.assign(this.shipment, val);
      this.initEditForm();
    }
  }
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  shipment: Delivery = { status: 'pending', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  searching = false;
  error = false;
  sites$: Observable<Site[]>;
  blob: any;
  uploading = false;

  private loadingCtrl = inject(LoadingController);
  private imgService = inject(ImgService);
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
        const shipment: Delivery = { ...this.form.value };

        shipment.items = this.itemBackup.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        shipment.code = this.masterSvc
          .edit()
          .generateDocCode(this.company.totalShipments, 'DEL');
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
          .toast('Delivery created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating delivery. Please try again!',
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
          .toast('Delivery updated successfully', 'success');
        if (this.shipment.status === 'pending') {
          this.initEditForm();
        } else if (this.shipment.status === 'reserved') {
          this.close();
        }
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the delivery. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  async sendDelivery() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
        Object.assign(this.shipment, this.form.value);
        this.shipment.items = this.itemBackup.filter(
          (item) => item.shipmentQty > 0
        );
        this.shipment.status = 'on-route';
        this.shipment.date = new Date();
        await this.upload();

        const res = await this.imgService.uploadBlob(
          this.blob,
          `company/${this.shipment.company.id}/shipments/${this.shipment.id}/signature`,
          ''
        );
        if (res) {
          this.shipment.signature = res.url;
          this.shipment.signatureRef = res.ref;
        }

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/shipments`,
            this.shipment.id,
            this.shipment
          );
        await this.downloadPdf();
        this.masterSvc
          .notification()
          .toast('Delivery updated successfully', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the delivery. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  async receiveDelivery(isAdmin?: boolean) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
        Object.assign(this.shipment, this.form.value);
        this.shipment.items = this.itemBackup.filter(
          (item) => item.shipmentQty > 0
        );
        this.shipment.status = 'received';
        this.shipment.date = new Date();
        await this.upload();

        if (this.blob) {
          const res = await this.imgService.uploadBlob(
            this.blob,
            `company/${this.shipment.company.id}/shipments/${this.shipment.id}/signature2`,
            ''
          );
          if (res) {
            if (isAdmin) {
              this.shipment.signature = res.url;
              this.shipment.signatureRef = res.ref;
            } else {
              this.shipment.signature2 = res.url;
              this.shipment.signatureRef2 = res.ref;
            }
          }
        }

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/shipments`,
            this.shipment.id,
            this.shipment
          );
        await this.downloadPdf();
        this.masterSvc
          .notification()
          .toast('Delivery updated successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the delivery. Please try again!',
            'danger'
          );
      } finally {
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

  async downloadPicklist() {
    if (!this.shipment.date) {
      this.shipment.date = new Date();
    }
    const pdf = await this.masterSvc
      .pdf()
      .pickList(this.shipment, this.shipment.items, this.company);
    this.masterSvc.pdf().handlePdf(pdf, `Picklist-${this.shipment.code}`);
  }
  async downloadPdf() {
    if (!this.shipment.date) {
      this.shipment.date = new Date();
    }
    const companyCopy = { ...this.company };
    companyCopy.rep = this.shipment.companyRepName;
    companyCopy.email = this.shipment.companyRepEmail;
    companyCopy.phone = this.shipment.companyRepContact;

    this.shipment.site.customer.rep = this.shipment.customerRepName;
    this.shipment.site.customer.email = this.shipment.customerRepEmail;
    this.shipment.site.customer.phone = this.shipment.customerRepContact;
    const loader = await this.loadingCtrl.create({
      message: 'Please wait',
      mode: 'ios',
    });
    try {
      loader.present();
      const pdf = await this.masterSvc
        .pdf()
        .delivery(this.shipment, companyCopy, null);
      this.masterSvc.pdf().handlePdf(pdf, this.shipment.code);
    } catch (error) {
      console.error('Error in downloading PDF:', error);
    } finally {
      loader.dismiss();
    }
  }

  protected async sign(ev: { signature: string; name: string }) {
    if (ev.signature) {
      this.blob = await (await fetch(ev.signature)).blob();
      if (this.shipment.status === 'pending') {
        this.shipment.signedBy = ev.name;
      } else if (this.shipment.status === 'on-route') {
        this.shipment.signedBy2 = ev.name;
      }
    } else {
      this.blob = null;
      return;
    }
  }

  protected onFileChanged(event) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const file: File = event.target.files[0];

      if (file) {
        Papa.parse(file, {
          header: true,
          worker: true,
          dynamicTyping: true,

          complete: async (result) => {
            this.uploading = true;
            const data = result.data.map((item) => ({
              code: item.code || '',
              location: item.location || '',
              shipmentQty: +item.totalQty || 0,
            }));
            const uploadTotal = data.length || 0;
            let uploadCounter = 0;
            for (const item of data) {
              let index = null;
              if (item.location) {
                index = this.items.findIndex(
                  (i) => i.code === item.code && i.location === item.location
                );
              } else {
                index = this.items.findIndex(
                  (i) => i.code === item.code && !i.location
                );
              }
              if (index !== -1) {
                this.items[index].shipmentQty = item.shipmentQty;
              } else {
                console.log('item not in master list', item);
              }
              uploadCounter++;
            }
            if (uploadCounter === uploadTotal) {
              this.uploading = false;
              this.masterSvc
                .notification()
                .toast('Import Successful', 'success');
            }
          },

          error: () => {
            this.uploading = false;
            this.masterSvc
              .notification()
              .toast('Import Failed. Please try again.', 'danger');
          },
        });
      }
    });
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.shipment.site, Validators.required],
      startDate: [this.shipment?.startDate, Validators.nullValidator],
      endDate: [this.shipment?.endDate, Validators.nullValidator],
      company: [this.company, Validators.required],
      status: [this.shipment.status, Validators.required],
      updatedBy: [this.user.id, Validators.required],
      driverName: [this.shipment?.driverName, Validators.nullValidator],
      driverNo: [this.shipment?.driverNo, Validators.nullValidator],
      vehicleReg: [this.shipment?.vehicleReg, Validators.nullValidator],
      notes: [this.shipment?.notes, Validators.nullValidator],
      jobReference: [this.shipment?.jobReference, Validators.required],
      companyRepName: [this.shipment?.companyRepName],
      companyRepEmail: [this.shipment?.companyRepEmail],
      companyRepContact: [this.shipment?.companyRepContact],
      customerRepName: [this.shipment?.customerRepName],
      customerRepEmail: [this.shipment?.customerRepEmail],
      customerRepContact: [this.shipment?.customerRepContact],
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
      startDate: ['', Validators.nullValidator],
      endDate: ['', Validators.nullValidator],
      company: [this.company, Validators.required],
      status: ['pending', Validators.required],
      createdBy: [this.user.id, Validators.required],
      createdByName: [this.user.name, Validators.required],
      driverName: ['', Validators.nullValidator],
      driverNo: ['', Validators.nullValidator],
      vehicleReg: ['', Validators.nullValidator],
      notes: ['', Validators.nullValidator],
      jobReference: ['', Validators.required],
      companyRepName: [''],
      companyRepEmail: [''],
      companyRepContact: [''],
      customerRepName: [''],
      customerRepEmail: [''],
      customerRepContact: [''],
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
    if (this.loading) {
      return;
    }
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
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating the delivery. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }

  private async autoCreate() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
      const shipment: Delivery = { ...this.form.value };
      shipment.items = this.itemBackup.filter((item) => item.shipmentQty > 0);
      this.company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);

      shipment.code = this.masterSvc
        .edit()
        .generateDocCode(this.company.totalShipments, 'DEL');
      await this.upload();
      shipment.uploads = this.shipment.uploads;
      const doc = await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/shipments`, shipment);

      this.shipment.id = doc.id;
      this.shipment.code = shipment.code;
      this.isEdit = true;
      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        totalShipments: increment(1),
      });
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong creating delivery. Please try again!',
          'danger'
        );
    } finally {
      this.loading = false;
    }
  }
}
