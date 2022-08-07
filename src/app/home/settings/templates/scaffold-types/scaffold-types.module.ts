import { NgModule } from '@angular/core';

import { ScaffoldTypesPageRoutingModule } from './scaffold-types-routing.module';

import { ComponentsModule } from 'src/app/components/components.module';
import { ScaffoldTypesPage } from './scaffold-types.page';

@NgModule({
  imports: [ComponentsModule, ScaffoldTypesPageRoutingModule],
  declarations: [ScaffoldTypesPage],
})
export class ScaffoldTypesPageModule {}
