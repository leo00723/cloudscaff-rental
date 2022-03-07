import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { ResetPageRoutingModule } from './reset-routing.module';
import { ResetPage } from './reset.page';

@NgModule({
  imports: [ComponentsModule, ResetPageRoutingModule],
  declarations: [ResetPage],
})
export class ResetPageModule {}
