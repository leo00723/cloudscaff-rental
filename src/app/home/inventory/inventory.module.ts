import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { InventoryPageRoutingModule } from './inventory-routing.module';
import { InventoryTableComponent } from './inventory-table/inventory-table.component';
import { InventoryPage } from './inventory.page';
import { ShipmentTableComponent } from './shipment-table/shipment-table.component';
import { TransferTableComponent } from './transfer-table/transfer-table.component';
import { BillableShipmentsTableComponent } from './billable-shipments-table/billable-shipments-table.component';

@NgModule({
  imports: [ComponentsModule, InventoryPageRoutingModule],
  declarations: [
    InventoryPage,
    InventoryTableComponent,
    ShipmentTableComponent,
    TransferTableComponent,
  ],
})
export class InventoryPageModule {}
