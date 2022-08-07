import { NgModule } from '@angular/core';

import { ComponentTypesPageRoutingModule } from './component-types-routing.module';

import { ComponentsModule } from 'src/app/components/components.module';
import { ComponentTypesPage } from './component-types.page';

@NgModule({
  imports: [ComponentsModule, ComponentTypesPageRoutingModule],
  declarations: [ComponentTypesPage],
})
export class ComponentTypesPageModule {}
