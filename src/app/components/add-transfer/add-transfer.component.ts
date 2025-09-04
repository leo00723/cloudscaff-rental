import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { increment, orderBy, where } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Site } from 'src/app/models/site.model';
import { TransactionItem } from 'src/app/models/transactionItem.model';
import { Transfer } from 'src/app/models/transfer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';

@Component({
  selector: 'app-add-transfer',
  templateUrl: './add-transfer.component.html',
})
export class AddTransferComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: Transfer) {
    if (val) {
      Object.assign(this.transfer, val);
      this.initEditForm();
    }
  }
  transfer: Transfer = { status: 'pending', uploads: [] };
  form: FormGroup;
  user: User;
  company: Company;
  items: TransactionItem[] = [];
  itemBackup: TransactionItem[];
  sites$: Observable<Site[]>;
  loading = false;
  viewAll = true;
  searching = false;
  error = false;
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
      this.initForm();
    }
  }

  createTransfer() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const transfer: Transfer = { ...this.form.value };
        this.itemBackup ||= [...this.items];
        transfer.items = this.itemBackup.filter((item) => item.returnQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        transfer.code = `TRA${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalTransfers ? this.company.totalTransfers + 1 : 1)
          .toString()
          .padStart(6, '0')}`;
        await this.upload();
        transfer.uploads = this.transfer.uploads;
        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/poTransfers`, transfer);

        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalTransfers: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Transfer created successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating transfer. Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }
  updateTransfer(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.transfer, this.form.value);
        this.itemBackup ||= [...this.items];
        this.transfer.items = this.itemBackup.filter(
          (item) => item.returnQty > 0
        );
        this.transfer.status = status;
        await this.upload();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/poTransfers`,
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

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.transfer.uploads.push(...newFiles);
  }
  async downloadPdf() {
    if (!this.transfer.date) {
      this.transfer.date = new Date();
    }
    const pdf = await this.masterSvc
      .pdf()
      .transferDoc(this.transfer, this.company, null);
    this.masterSvc.pdf().handlePdf(pdf, this.transfer.code);
  }

  delete() {
    // this.masterSvc.notification().presentAlertConfirm(async () => {
    //   await this.masterSvc
    //     .edit()
    //     .deleteDocById(
    //       `company/${this.company.id}/poTransfers`,
    //       this.transfer.id
    //     );
    //   this.close();
    // });
  }

  changeFromSite(event) {
    this.field('fromSite').setValue(event[0]);
    this.field('fromJobReference').setValue('');
    this.items = [];
  }
  changeToSite(event) {
    this.field('toSite').setValue(event[0]);
    this.field('toJobReference').setValue('');
  }

  update(val, item: TransactionItem) {
    item.returnQty = +val.detail.value;
    if (item.returnQty > item.balanceQty || item.returnQty < 0) {
      item.error = true;
      this.error = true;
    } else {
      item.error = false;
      this.error = false;
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

  protected getTransactions(value: any) {
    const jobReference = this.field('fromJobReference').value;
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
          where('siteId', '==', this.field('fromSite').value.id),
        ])
        .pipe(take(1))
        .subscribe((data) => {
          this.items = data;
        })
    );
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      fromSite: [this.transfer.fromSite, Validators.required],
      fromJobReference: [this.transfer.fromJobReference, Validators.required],
      toSite: [this.transfer.toSite, Validators.required],
      toJobReference: [this.transfer.toJobReference, Validators.required],
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
          .getCollectionFiltered(`company/${this.company.id}/transactionLog`, [
            where('status', '==', 'active'),
            where('transactionType', '==', 'Delivery'),
            where('jobReference', '==', this.transfer.fromJobReference),
            where('siteId', '==', this.transfer.fromSite.id),
          ])
          .pipe(take(1))
          .subscribe((data) => {
            this.transfer.items.forEach((item) => {
              const inventoryItem = data.find((i) => i.id === item.id);
              if (inventoryItem) {
                inventoryItem.returnQty = +item.returnQty;
              }
            });
            this.items = data;
          })
      );
    } else {
      this.items = this.transfer.items;
    }
  }
  private initForm() {
    this.form = this.masterSvc.fb().group({
      fromSite: ['', Validators.required],
      fromJobReference: ['', Validators.required],
      toSite: ['', Validators.required],
      toJobReference: ['', Validators.required],
      transferDate: ['', Validators.required],
      notes: ['', Validators.nullValidator],
      createdBy: [this.user.id],
      createdByName: [this.user.name],
      status: ['pending', Validators.required],
      company: [this.company],
      date: [new Date()],
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
