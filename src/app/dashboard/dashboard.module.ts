import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [ComponentsModule, DashboardPageRoutingModule],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}
