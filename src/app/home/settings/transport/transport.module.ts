import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { TransportPageRoutingModule } from './transport-routing.module';
import { TransportTableComponent } from './transport-table/transport-table.component';
import { TransportPage } from './transport.page';
import { AddTransportComponent } from './add-transport/add-transport.component';

@NgModule({
  imports: [ComponentsModule, TransportPageRoutingModule],
  declarations: [TransportPage, TransportTableComponent, AddTransportComponent],
})
export class TransportPageModule {}
