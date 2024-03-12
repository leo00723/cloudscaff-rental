import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { map, take } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import cloneDeep from 'lodash/cloneDeep';

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
  // Input property for passing data to the component
  @Input() set data(value: User[]) {
    // Deep copy the input value to prevent mutation
    this.selectedUsers = cloneDeep(value);
  }

  // Component properties
  users: User[];
  usersBackup: User[];
  isLoading = true;
  items = [10, 10, 10, 10];
  selectedUsers: User[] = [];

  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.init(); // Initialize component
  }

  // Fetch users based on company ID
  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    if (id) {
      // Subscribe to user data
      this.masterSvc
        .edit()
        .getCollectionWhere('users', 'company', '==', id)
        .pipe(
          map((users) =>
            users.map((u) => ({
              ...u,
              selected: this.selectedUsers.some((s) => s.id === u.id),
            }))
          ),
          take(2)
        )
        .subscribe((users) => {
          this.users = users;
          this.usersBackup = users; // Backup original users
          this.change.detectChanges(); // Trigger change detection
        });
    } else {
      // Log and retry after delay if company ID is not available
      this.masterSvc.log(
        '-----------------------try users----------------------'
      );
      setTimeout(() => this.init(), 200);
    }
  }

  // Track items by index
  trackItem(index) {
    return index;
  }

  // Select or deselect a user
  selectUser(selectedUser: any) {
    const index = this.selectedUsers.findIndex((u) => u.id === selectedUser.id);
    if (index === -1 && !selectedUser.selected) {
      this.selectedUsers.push(selectedUser);
    } else if (selectedUser.selected) {
      this.selectedUsers.splice(index, 1);
    }
  }

  // Update user list based on filter value
  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.users = this.usersBackup
      .map((user) => ({
        ...user,
        // Preserve the selected state of users from the backup array
        selected: this.selectedUsers.some((s) => s.id === user.id),
      }))
      .filter(
        (u) =>
          u.email.toLowerCase().includes(val) ||
          u.name?.toLowerCase().includes(val) ||
          u.title?.toLowerCase().includes(val)
      );
  }

  // Complete user selection and dismiss modal
  done() {
    this.masterSvc.modal().dismiss(this.selectedUsers, 'close', 'selectUsers');
  }
}
