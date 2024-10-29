import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Request } from 'src/app/models/request.model';
import { Delivery } from 'src/app/models/delivery.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-add-request',
  templateUrl: './add-request.component.html',
})
export class AddRequestComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() allowSend = false;
  @Input() site: Site;
  @Input() set value(val: Request) {
    if (val) {
      Object.assign(this.request, val);
      this.initEditForm();
    }
  }
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  request: Request = { status: 'pending' };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  searching = false;
  error = false;
  private inventoryItems$: Observable<InventoryItem[]>;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.inventoryItems$ = this.masterSvc
      .edit()
      .getCollectionOrdered(
        `company/${this.company.id}/stockItems`,
        'code',
        'asc'
      );
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

  checkError(item: InventoryItem) {
    const totalQty = item.availableQty ? item.availableQty : 0;
    const inUseQty = item.inUseQty ? item.inUseQty : 0;
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    if (item.shipmentQty > availableQty) {
      item.deficit = item.shipmentQty - availableQty;
      item.error = true;
      this.error = true;
    } else {
      item.error = false;
      this.error = false;
    }
  }

  createRequest() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const request: Request = { ...this.form.value };
        request.items = this.items.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        request.code = `REQ${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalRequests ? this.company.totalRequests + 1 : 1)
          .toString()
          .padStart(6, '0')}`;

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/requests`, request);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalRequests: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Request created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating request. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  updateRequest(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.request, this.form.value);
        this.request.items = this.items.filter((item) => item.shipmentQty > 0);
        this.request.status = status;
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/requests`,
            this.request.id,
            this.request
          );
        this.masterSvc
          .notification()
          .toast('Request updated successfully', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the request. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  approveRequest() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        let hasDeficit = false;
        const shipment: Delivery = {
          ...this.request,
          items: cloneDeep(this.request.items),
          status: 'pending',
        };
        const newRequest: Request = {
          ...this.request,
          items: cloneDeep(this.request.items),
        };
        for (const sItem of shipment.items) {
          this.checkError(sItem);
          if (sItem.deficit) {
            sItem.shipmentQty = sItem.shipmentQty - sItem.deficit;
          }
          delete sItem.log;
        }
        for (const rItem of newRequest.items) {
          this.checkError(rItem);
          if (rItem.deficit) {
            rItem.shipmentQty = rItem.deficit;
            rItem.deficit = 0;
            hasDeficit = true;
          }
          delete rItem.log;
        }

        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        shipment.code = this.masterSvc
          .edit()
          .generateDocCode(this.company.totalShipments, 'DEL');
        newRequest.status = hasDeficit ? 'partial shipment' : 'approved';

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/requests`,
            this.request.id,
            newRequest
          );
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/shipments`, shipment);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalShipments: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Shipment created successfully', 'success');
        this.masterSvc.modal().dismiss(true, 'approved');
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

  autoSave(val, item) {
    item.shipmentQty = Math.abs(+val);
    this.checkError(item);
    if (this.isEdit) {
      if (this.request.status === 'pending') {
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

  delete() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      await this.masterSvc
        .edit()
        .deleteDocById(`company/${this.company.id}/shipments`, this.request.id);
      this.close();
    });
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.request.site, Validators.required],
      startDate: [this.request.startDate, Validators.nullValidator],
      endDate: [this.request.endDate, Validators.nullValidator],
      company: [this.company, Validators.required],
      status: [this.request.status, Validators.required],
      updatedBy: [this.user.id, Validators.required],
      notes: [this.request.notes || ''],
    });
    if (
      this.request.status === 'pending' ||
      this.request.status === 'submitted' ||
      this.request.status === 'partial shipment'
    ) {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          items.forEach((dbItem) => {
            dbItem.shipmentQty = null;
          });
          this.request.items.forEach((item) => {
            const inventoryItem = items.find((i) => i.id === item.id);
            if (inventoryItem) {
              inventoryItem.shipmentQty = +item.shipmentQty;
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.request.items;
    }
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.site, Validators.required],
      startDate: ['', Validators.nullValidator],
      endDate: ['', Validators.nullValidator],
      company: [this.company, Validators.required],
      status: ['pending', Validators.required],
      createdBy: [this.user.id, Validators.required],
      createdByName: [this.user.name, Validators.required],
      notes: [''],
    });
  }

  private async autoUpdate() {
    this.loading = true;
    try {
      this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
      Object.assign(this.request, this.form.value);
      this.request.items = this.itemBackup.filter(
        (item) => item.shipmentQty > 0
      );
      this.request.status = 'pending';
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/requests`,
          this.request.id,
          this.request
        );

      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating the request. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }

  private async autoCreate() {
    this.loading = true;
    try {
      this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
      const request: Request = { ...this.form.value };
      request.items = this.itemBackup.filter((item) => item.shipmentQty > 0);
      this.company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);

      request.code = `REQ${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${(this.company.totalRequests ? this.company.totalRequests + 1 : 1)
        .toString()
        .padStart(6, '0')}`;

      const doc = await this.masterSvc
        .edit()
        .addDocument(`company/${this.company.id}/requests`, request);

      this.request.id = doc.id;
      this.isEdit = true;
      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        totalRequests: increment(1),
      });

      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong creating request. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }
}
