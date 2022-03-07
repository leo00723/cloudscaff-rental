import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddBrokerComponent } from './add-broker/add-broker.component';
import { BrokerComponent } from './broker/broker.component';
import { LaborTableComponent } from './labor-table/labor-table.component';
import { LabourPageRoutingModule } from './labour-routing.module';
import { LabourPage } from './labour.page';

@NgModule({
  imports: [LabourPageRoutingModule, ComponentsModule],
  declarations: [
    LabourPage,
    BrokerComponent,
    AddBrokerComponent,
    LaborTableComponent,
  ],
})
export class LabourPageModule {}
