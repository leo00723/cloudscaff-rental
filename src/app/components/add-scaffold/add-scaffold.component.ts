import { Component, Input, OnInit, inject } from '@angular/core';
import { arrayUnion, increment } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { SI } from 'src/app/models/si.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
@Component({
  selector: 'app-add-scaffold',
  templateUrl: './add-scaffold.component.html',
})
export class AddScaffoldComponent implements OnInit {
  @Input() set siteData(site: Site) {
    if (site) {
      this.site = site;
      this.initForm();
    }
  }
  @Input() siData?: SI;

  user: User;
  company: Company;
  types$: Observable<any>;

  site: Site;
  scaffold: Scaffold;
  form: FormGroup;
  isLoading = false;
  private masterSvc: MasterService = inject(MasterService);
  constructor() {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    this.types$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/templates`, 'scaffoldTypes');
  }

  ngOnInit(): void {}

  close() {
    this.masterSvc.modal().dismiss();
  }

  get attachmentsForms() {
    return this.form.get('attachments') as FormArray;
  }
  get boardForms() {
    return this.form.get('boards') as FormArray;
  }

  addAttachment() {
    const attachment = this.masterSvc.fb().group({
      boardedLifts: [''],
      daysStanding: [''],
      description: [''],
      extraHire: [''],
      extraHirePercentage: [''],
      height: ['', [Validators.required, Validators.min(1)]],
      hireRate: [''],
      hireTotal: [0],
      isWeeks: [''],
      length: ['', [Validators.required, Validators.min(1)]],
      level: [''],
      lifts: [''],
      rate: [''],
      total: [0],
      type: [''],
      width: ['', [Validators.required, Validators.min(1)]],
    });

    this.attachmentsForms.push(attachment);
  }

  addBoard() {
    const board = this.masterSvc.fb().group({
      rate: [''],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      qty: ['', [Validators.required, Validators.min(1)]],
      extraHirePercentage: [''],
      extraHire: [''],
      total: [0],
    });
    this.boardForms.push(board);
  }

  deleteAttachment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.attachmentsForms.removeAt(i);
    });
  }
  deleteBoard(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.boardForms.removeAt(i);
    });
  }

  createScaffold() {
    try {
      this.isLoading = true;
      if (this.form.valid) {
        this.masterSvc.notification().presentAlertConfirm(async () => {
          const code = this.masterSvc
            .edit()
            .generateDocCode(this.site.totalScaffolds, 'SCA');

          this.scaffold = this.form.value;
          this.scaffold.code = code;
          this.scaffold.createdBy = this.user.id;
          if (this.siData) {
            this.scaffold.siIDS = [this.siData.id];
          }
          const doc = await this.masterSvc
            .edit()
            .addDocument(`company/${this.company.id}/scaffolds`, this.scaffold);
          if (this.siData) {
            await this.masterSvc
              .edit()
              .updateDoc(
                `company/${this.company.id}/siteInstructions`,
                this.siData.id,
                {
                  scaffoldIDs: arrayUnion(doc.id),
                  status: 'scaffold created',
                }
              );
          }
          await this.masterSvc
            .edit()
            .updateDoc(`company/${this.company.id}/sites`, this.site.id, {
              totalScaffolds: increment(1),
            });
          this.masterSvc
            .notification()
            .toast('Scaffold created successfully.', 'success');
          this.close();
        });
      } else {
        this.form.markAllAsTouched();
        this.form = cloneDeep(this.form);
      }
    } catch (error) {
      console.log(error);
      this.masterSvc
        .notification()
        .toast('Something went wrong, please try again.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      code: null,
      companyId: this.site.companyId,
      customerId: this.site.customer.id,
      siteId: this.site.id,
      siteCode: this.site.code,
      siteName: this.site.name,
      scaffold: this.masterSvc.fb().group({
        rate: [''],
        type: [''],
        description: [''],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        lifts: [''],
        boardedLifts: [''],
        extraHirePercentage: [''],
        extraHire: [''],
        level: [0],
        total: [0],
        hireRate: [''],
        daysStanding: [''],
        hireTotal: [0],
        isWeeks: [''],
      }),
      attachments: this.masterSvc.fb().array([]),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [''],
        daysStanding: [''],
        total: [0],
        isWeeks: ['', Validators.nullValidator],
      }),
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      poNumber: null,
      woNumber: null,
      createdBy: null,
      startDate: [''],
      endDate: [''],
      date: new Date(),
      totalModifications: 0,
      users: this.masterSvc.fb().array([]),
      status: 'pending-Work In Progress',
    });
  }
}
