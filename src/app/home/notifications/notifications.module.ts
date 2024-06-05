import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { NotificationsPage } from './notifications.page';
import { NotificationsPageRoutingModule } from './notifications-routing.module';

@NgModule({
  imports: [ComponentsModule, NotificationsPageRoutingModule],
  declarations: [NotificationsPage],
})
export class NotificationsPageModule {}
