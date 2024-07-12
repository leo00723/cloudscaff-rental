import { NgModule } from '@angular/core';

import { ComponentsModule } from 'src/app/components/components.module';
import { HandoversPageRoutingModule } from './handovers-routing.module';
import { HandoversPage } from './handovers.page';

@NgModule({
  imports: [ComponentsModule, HandoversPageRoutingModule],
  declarations: [HandoversPage],
})
export class HandoversPageModule {}
