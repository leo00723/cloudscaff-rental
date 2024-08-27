import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { InspectionTableComponent } from './inspection-table/inspection-table.component';
import { ViewScaffoldPageRoutingModule } from './view-scaffold-routing.module';
import { ViewScaffoldPage } from './view-scaffold.page';

@NgModule({
  imports: [ComponentsModule, ViewScaffoldPageRoutingModule],
  declarations: [ViewScaffoldPage, InspectionTableComponent],
})
export class ViewScaffoldPageModule {}
