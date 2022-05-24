import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { GetSites } from 'src/app/home/sites/state/sites.actions';
import { SitesState } from 'src/app/home/sites/state/sites.state';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Site } from 'src/app/models/site.model';
import { Transfer } from 'src/app/models/transfer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-transfer',
  templateUrl: './add-transfer.component.html',
})
export class AddTransferComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() set value(val: Transfer) {
    if (val) {
      Object.assign(this.transfer, val);
      this.initEditForm();
    }
  }
  transfer: Transfer = { status: 'pending' };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  items: InventoryItem[];
  error = false;
  @Select() sites$: Observable<Site[]>;
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    let sites = !!this.masterSvc.store().selectSnapshot(SitesState.sites);
    if (!sites) this.masterSvc.store().dispatch(new GetSites(this.company.id));
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit() {
    if (!this.isEdit) {
      this.initForm();
    }
  }

  createTransfer() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        let transfer: Transfer = { ...this.form.value };
        transfer.items = this.items.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        transfer.code = `TRA${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalTransfers ? this.company.totalTransfers + 1 : 1)
          .toString()
          .padStart(6, '0')}`;

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/transfers`, transfer);

        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalTransfers: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Transfer created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating transfer. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  updateTransfer(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.transfer, this.form.value);
        this.transfer.items = this.items.filter((item) => item.shipmentQty > 0);
        this.transfer.status = status;

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/transfers`,
            this.transfer.id,
            this.transfer
          );

        this.masterSvc
          .notification()
          .toast('Transfer updated successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating transfer. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  updateItems() {
    const fromSite = this.field('fromSite').value.id;
    this.subs.add(
      this.masterSvc
        .edit()
        .getDocById(`company/${this.company.id}/siteStock`, fromSite)
        .subscribe((data) => {
          this.items = data.items;
        })
    );
  }
  update(val, item: InventoryItem) {
    item.shipmentQty = +val.detail.value;
    this.checkError(item);
  }
  checkError(item: InventoryItem) {
    const totalQty = item.availableQty ? item.availableQty : 0;
    const inUseQty = item.inUseQty ? item.inUseQty : 0;
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    if (item.shipmentQty > availableQty || item.shipmentQty < 0) {
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
      fromSite: [this.transfer.fromSite, Validators.required],
      toSite: [this.transfer.toSite, Validators.required],
      transferDate: [this.transfer.transferDate, Validators.required],
      notes: [this.transfer.notes, Validators.nullValidator],
      updatedBy: [this.user.id],
      status: [this.transfer.status, Validators.required],
      company: [this.company],
      date: [new Date()],
    });
    if (this.transfer.status === 'pending') {
      this.subs.add(
        this.masterSvc
          .edit()
          .getDocById(
            `company/${this.company.id}/siteStock`,
            this.transfer.fromSite.id
          )
          .subscribe((data) => {
            this.transfer.items.forEach((item) => {
              const inventoryItem = data.items.find((i) => i.id === item.id);
              if (inventoryItem) {
                inventoryItem.shipmentQty = +item.shipmentQty;
              }
            });
            this.items = data.items;
          })
      );
    } else {
      this.items = this.transfer.items;
    }
  }
  private initForm() {
    this.form = this.masterSvc.fb().group({
      fromSite: ['', Validators.required],
      toSite: ['', Validators.required],
      transferDate: ['', Validators.required],
      notes: ['', Validators.nullValidator],
      createdBy: [this.user.id],
      status: ['pending', Validators.required],
      company: [this.company],
      date: [new Date()],
    });
  }
}
