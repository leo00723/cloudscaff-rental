import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { InventoryPageRoutingModule } from './inventory-routing.module';
import { InventoryTableComponent } from './inventory-table/inventory-table.component';
import { InventoryPage } from './inventory.page';
import { TransferTableComponent } from './transfer-table/transfer-table.component';
import { BulkUpdateTableComponent } from './bulk-update-table/bulk-update-table.component';
import { InventoryBulkUpdateComponent } from './inventory-bulk-update/inventory-bulk-update.component';

@NgModule({
  imports: [ComponentsModule, InventoryPageRoutingModule],
  declarations: [
    InventoryPage,
    InventoryTableComponent,
    TransferTableComponent,
    BulkUpdateTableComponent,
    InventoryBulkUpdateComponent,
  ],
})
export class InventoryPageModule {}
