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
  @Select() company$: Observable<Company>;
  @Input() scaffold: Scaffold;
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
        length: [
          this.scaffold.scaffold.length,
          [Validators.required, Validators.min(1)],
        ],
        width: [
          this.scaffold.scaffold.width,
          [Validators.required, Validators.min(1)],
        ],
        height: [
          this.scaffold.scaffold.height,
          [Validators.required, Validators.min(1)],
        ],
      }),
      boards: this.fb.array(
        this.scaffold.boards.map((board) => {
          return this.fb.group({
            length: [board.length, [Validators.required, Validators.min(1)]],
            width: [board.width, [Validators.required, Validators.min(1)]],
            height: [board.height, [Validators.required, Validators.min(1)]],
            qty: [board.qty, [Validators.required, Validators.min(1)]],
          });
        })
      ),
    });
    this.subs.add(
      this.form.valueChanges.subscribe((value) => {
        this.formResult.emit(value);
        console.log('-----------------------change');
      })
    );
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
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
