import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { user } from 'rxfire/auth';
import { map, Observable, Subscription, tap } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-user-picker',
  templateUrl: './user-picker.component.html',
  styles: [
    `
      cdk-virtual-scroll-viewport {
        height: 100%;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPickerComponent implements OnInit {
  users: User[];
  usersBackup: User[];
  isLoading = true;
  items = [10, 10, 10, 10];
  @Input() selectedUsers: User[] = [];
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.init();
  }

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.subs.add(
          this.masterSvc
            .edit()
            .getCollectionWhere('users', 'company', '==', id)
            .pipe(
              map((users) => {
                return users.map((u) => {
                  let user = { ...u, selected: false };
                  this.selectedUsers.forEach((s) => {
                    if (u.id === s.id) {
                      user = { ...user, selected: true };
                    }
                  });

                  return user;
                });
              })
            )
            .subscribe((users) => {
              this.users = users;
              this.usersBackup = users;
              this.change.detectChanges();
            })
        );
      } else {
        console.log('-----------------------try users----------------------');
        this.init();
      }
    }, 200);
  }

  trackItem(index) {
    return index;
  }

  selectUser(user: any) {
    const index = this.selectedUsers.findIndex((u) => u.id === user.id);
    if (index === -1 && user.selected) {
      this.selectedUsers.push(user);
    } else if (!user.selected) {
      this.selectedUsers.splice(index, 1);
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.users = this.usersBackup.filter(
      (d) =>
        d.email.toLowerCase().indexOf(val) !== -1 ||
        d.role.toLowerCase().indexOf(val) !== -1 ||
        !val
    );
  }

  done() {
    this.masterSvc.modal().dismiss(this.selectedUsers, 'close', 'selectUsers');
  }
}
