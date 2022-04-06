import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { InspectionTableComponent } from './inspection-table/inspection-table.component';
import { ViewScaffoldPageRoutingModule } from './view-scaffold-routing.module';
import { ViewScaffoldPage } from './view-scaffold.page';
import { HandoverTableComponent } from './handover-table/handover-table.component';
import { ModificationTableComponent } from './modification-table/modification-table.component';

@NgModule({
  imports: [ComponentsModule, ViewScaffoldPageRoutingModule],
  declarations: [ViewScaffoldPage, InspectionTableComponent, HandoverTableComponent, ModificationTableComponent],
})
export class ViewScaffoldPageModule {}
