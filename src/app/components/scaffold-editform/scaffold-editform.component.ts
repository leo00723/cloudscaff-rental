import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Item } from 'src/app/models/item.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-scaffold-editform',
  templateUrl: './scaffold-editform.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldEditformComponent implements OnInit, OnDestroy {
  @Input() scaffold: Scaffold;
  @Select() company$: Observable<Company>;
  form: FormGroup;
  @Output() formResult = new EventEmitter<{ boards: Item[]; scaffold: Item }>();
  private subs = new Subscription();
  constructor(
    private fb: FormBuilder,
    private notificationSvc: NotificationService
  ) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    const handover = this.scaffold?.latestHandover?.scaffold || null;
    this.form = this.fb.group({
      scaffold: this.fb.group({
        description: [handover?.scaffold?.description || ''],
        location: [handover?.scaffold?.location || ''],
        length: [
          handover?.scaffold?.length || '',
          [Validators.required, Validators.min(0)],
        ],
        width: [
          handover?.scaffold?.width || '',
          [Validators.required, Validators.min(0)],
        ],
        height: [
          handover?.scaffold?.height || '',
          [Validators.required, Validators.min(0)],
        ],
        safe: [handover?.scaffold?.safe || '', [Validators.required]],
        level: [1, [Validators.nullValidator]],
      }),
      attachments: this.fb.array([]),
      boards: this.fb.array([]),
    });
    handover?.attachments.forEach((item) => {
      const attachment = this.fb.group({
        description: [item?.description || ''],
        location: [item?.location || ''],
        length: [item.length || '', [Validators.required, Validators.min(0)]],
        width: [item.width || '', [Validators.required, Validators.min(0)]],
        height: [item.height || '', [Validators.required, Validators.min(0)]],
        safe: [item.safe || '', [Validators.required]],
        level: [item.level || '', [Validators.nullValidator]],
      });
      this.attachmentForms.push(attachment);
    });
    handover?.boards.forEach((item) => {
      const board = this.fb.group({
        length: [item.length || '', [Validators.required, Validators.min(0)]],
        width: [item.width || '', [Validators.required, Validators.min(0)]],
        height: [item.height || '', [Validators.required, Validators.min(0)]],
        qty: [item.qty || '', [Validators.required, Validators.min(1)]],
      });
      this.boardForms.push(board);
    });
    this.subs.add(
      this.form.valueChanges.subscribe((value) => {
        this.formResult.emit(value);
      })
    );
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  get attachmentForms() {
    return this.form.get('attachments') as FormArray;
  }
  addAttachment() {
    const attachment = this.fb.group({
      length: ['', [Validators.required, Validators.min(0)]],
      width: ['', [Validators.required, Validators.min(0)]],
      height: ['', [Validators.required, Validators.min(0)]],
      safe: ['', [Validators.required]],
      level: ['', [Validators.nullValidator]],
    });
    this.attachmentForms.push(attachment);
  }

  deleteAttachment(i: number) {
    this.notificationSvc.presentAlertConfirm(() => {
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
      height: ['', [Validators.required, Validators.min(0)]],
      qty: ['', [Validators.required, Validators.min(1)]],
    });
    this.boardForms.push(board);
  }

  deleteBoard(i: number) {
    this.notificationSvc.presentAlertConfirm(() => {
      this.boardForms.removeAt(i);
    });
  }
}
