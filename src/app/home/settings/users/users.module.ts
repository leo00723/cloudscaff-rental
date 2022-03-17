import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddUserComponent } from './add-user/add-user.component';
import { UserTableComponent } from './user-table/user-table.component';
import { UsersPageRoutingModule } from './users-routing.module';
import { UsersPage } from './users.page';

@NgModule({
  imports: [ComponentsModule, UsersPageRoutingModule],
  declarations: [UsersPage, UserTableComponent, AddUserComponent],
})
export class UsersPageModule {}
