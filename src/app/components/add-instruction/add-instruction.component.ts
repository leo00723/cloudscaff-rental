import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { arrayUnion, orderBy, where } from '@angular/fire/firestore';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Select } from '@ngxs/store';
import { increment } from 'firebase/firestore';
import cloneDeep from 'lodash/cloneDeep';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { SI } from 'src/app/models/si.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { UtilityService } from 'src/app/services/utility.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../multiuploader/multiuploader.component';
import { SignatureModalComponent } from '../signature-modal/signature-modal.component';
@Component({
  selector: 'app-add-instruction',
  templateUrl: './add-instruction.component.html',
})
export class AddInstructionComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() site: Site;
  @Input() scaffoldID?: string;
  @Input() isEdit = false;
  @Input() isScaffold = false;
  @Input() set value(val: SI) {
    if (val) {
      Object.assign(this.siteInstruction, val);
    }
  }
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  customer$: Observable<Customer>;
  siteInstruction: SI = {
    status: 'needs signature',
    date: new Date(),
    uploads: [],
    additionals: [],
    attachments: [],
    boards: [],
    signatures: [],
    scaffoldIDs: [],
  };
  form: FormGroup;
  scaffolds$: Observable<Scaffold[]>;
  loading = false;
  protected utilitySvc = inject(UtilityService);
  private masterSvc = inject(MasterService);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      additionals: this.fb.array([]),
      attachments: this.fb.array([]),
      boards: this.fb.array([]),
      notes: [''],
    });
  }

  ngOnInit(): void {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.siteInstruction.site = cloneDeep(this.site);
    this.customer$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${company.id}/customers`,
        this.site.customer.id
      ) as Observable<Customer>;
    this.siteInstruction?.additionals.forEach((item) => {
      const additional = this.fb.group({
        description: [
          item.description || '',
          [Validators.required, Validators.min(0)],
        ],
      });
      this.additionalForms.push(additional);
    });
    this.siteInstruction?.attachments.forEach((item) => {
      const attachment = this.fb.group({
        length: [item.length || '', [Validators.required, Validators.min(0)]],
        width: [item.width || '', [Validators.required, Validators.min(0)]],
        height: [item.height || '', [Validators.required, Validators.min(0)]],
        description: [
          item.description || '',
          [Validators.nullValidator, Validators.min(0)],
        ],

        level: [item.level || '', [Validators.nullValidator]],
      });
      this.attachmentForms.push(attachment);
    });
    this.siteInstruction?.boards.forEach((item) => {
      const board = this.fb.group({
        length: [item.length || '', [Validators.required, Validators.min(0)]],
        width: [item.width || '', [Validators.required, Validators.min(0)]],
        description: [
          item.description || '',
          [Validators.nullValidator, Validators.min(0)],
        ],
        qty: [item.qty || '', [Validators.required, Validators.min(1)]],
      });
      this.boardForms.push(board);
    });
    this.form.get('notes').setValue(this.siteInstruction?.notes || '');
    if (this.siteInstruction.id) {
      this.scaffolds$ = this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${company.id}/scaffolds`, [
          where('siIDS', 'array-contains', this.siteInstruction.id),
          orderBy('code', 'desc'),
        ]);
    }
  }

  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }
  addAdditional() {
    const additional = this.fb.group({
      description: ['', [Validators.required, Validators.min(0)]],
    });
    this.additionalForms.push(additional);
  }

  deleteAdditional(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.additionalForms.removeAt(i);
    });
  }
  get attachmentForms() {
    return this.form.get('attachments') as FormArray;
  }
  addAttachment() {
    const attachment = this.fb.group({
      length: ['', [Validators.required, Validators.min(0)]],
      width: ['', [Validators.required, Validators.min(0)]],
      height: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.nullValidator, Validators.min(0)]],
      level: ['', [Validators.nullValidator]],
    });
    this.attachmentForms.push(attachment);
  }

  deleteAttachment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.attachmentForms.removeAt(i);
    });
  }

  get boardForms() {
    return this.form.get('boards') as FormArray;
  }
  addBoard() {
    const board = this.fb.group({
      length: ['', [Validators.required, Validators.min(0)]],
      width: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.nullValidator, Validators.min(0)]],
      qty: ['', [Validators.required, Validators.min(1)]],
    });
    this.boardForms.push(board);
  }

  deleteBoard(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.boardForms.removeAt(i);
    });
  }
  protected field(field: string) {
    return this.form.get(field) as FormControl;
  }

  createInstruction(customer: Customer) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.siteInstruction.code = this.masterSvc
          .edit()
          .generateDocCode(company.totalSIs, 'SI');
        this.siteInstruction.createdBy = user.id;
        this.siteInstruction.createdByName = user.name;
        this.siteInstruction.company = company;
        this.siteInstruction.customer = customer;
        this.siteInstruction = { ...this.siteInstruction, ...this.form.value };
        if (this.scaffoldID) {
          this.siteInstruction.scaffoldIDs.push(this.scaffoldID);
        }
        await this.upload();
        const doc = await this.masterSvc
          .edit()
          .addDocument(
            `company/${company.id}/siteInstructions`,
            this.siteInstruction
          );
        await this.masterSvc.edit().updateDoc('company', company.id, {
          totalSIs: increment(1),
        });
        if (this.scaffoldID) {
          await this.masterSvc
            .edit()
            .updateDoc(`company/${company.id}/scaffolds`, this.scaffoldID, {
              siIDS: arrayUnion(doc.id),
            });
        }
        this.masterSvc
          .notification()
          .toast('Site Instruction created successfully', 'success');
        this.loading = false;
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your Site Instruction, Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  updateInstruction(customer: Customer) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        this.siteInstruction.createdBy = user.id;
        this.siteInstruction.createdByName = user.name;
        this.siteInstruction.company = company;
        this.siteInstruction.customer = customer;
        this.siteInstruction = { ...this.siteInstruction, ...this.form.value };
        await this.upload();
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${company.id}/siteInstructions`,
            this.siteInstruction.id,
            this.siteInstruction
          );
        this.masterSvc
          .notification()
          .toast('Site Instruction updated successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating your Site Instruction, Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  async sign() {
    const modal = await this.masterSvc.modal().create({
      component: SignatureModalComponent,
      showBackdrop: true,
      id: 'sign',
      cssClass: 'fullscreen',
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.loading = true;

      const blob = await (await fetch(data.signature)).blob();
      const num = this.siteInstruction.signatures.length;
      const res = await this.masterSvc
        .img()
        .uploadBlob(
          blob,
          `company/${this.siteInstruction.company.id}/instructions/${this.siteInstruction.id}/signature${num}`,
          ''
        );
      this.siteInstruction.signatures
        ? this.siteInstruction.signatures.push({
            signature: res.url,
            signatureRef: res.ref,
            signedBy: data.name,
          })
        : (this.siteInstruction.signatures = [
            {
              signature: res.url,
              signatureRef: res.ref,
              signedBy: data.name,
            },
          ]);
      this.siteInstruction.status = 'signed';
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.siteInstruction.company.id}/siteInstructions`,
          this.siteInstruction.id,
          this.siteInstruction
        );
      this.masterSvc
        .notification()
        .toast('Site Instruction signed successfully', 'success');
    }
    this.loading = false;
  }

  deleteInstruction() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .deleteDocById(
            `company/${this.siteInstruction.company.id}/siteInstructions`,
            this.siteInstruction.id
          );
        this.masterSvc
          .notification()
          .toast('Site Instruction deleted successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong deleting your Site Instruction, Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  updateStatus(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.siteInstruction.company.id}/siteInstructions`,
            this.siteInstruction.id,
            { status }
          );
        this.masterSvc
          .notification()
          .toast('Site Instruction updated successfully', 'success');
        this.close();
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating your Site Instruction, Please try again!',
            'danger'
          );
      } finally {
        this.loading = false;
      }
    });
  }

  createScaffold() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.masterSvc
        .modal()
        .dismiss(this.siteInstruction, 'create-scaffold', 'viewInstruction');
    });
  }

  viewScaffold(scaffold: Scaffold) {
    window.open(
      `https://app.cloudscaff.com//dashboard/scaffold/${scaffold.companyId}-${scaffold.siteId}-${scaffold.id}`,
      '_blank'
    );
  }

  close() {
    this.masterSvc
      .modal()
      .dismiss(
        null,
        'close',
        this.isEdit ? 'viewInstruction' : 'addInstruction'
      );
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.siteInstruction.uploads.push(...newFiles);
  }
}
