import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-scaffold-editform',
  templateUrl: './scaffold-editform.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldEditformComponent implements OnInit, OnDestroy {
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
    this.form = this.fb.group({
      scaffold: this.fb.group({
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        safe: ['', [Validators.required]],
        level: [1, [Validators.nullValidator]],
      }),
      attachments: this.fb.array([]),
      boards: this.fb.array([]),
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
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
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
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
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
