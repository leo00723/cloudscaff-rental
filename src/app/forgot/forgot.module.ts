import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { ForgotPageRoutingModule } from './forgot-routing.module';
import { ForgotPage } from './forgot.page';

@NgModule({
  imports: [ComponentsModule, ForgotPageRoutingModule],
  declarations: [ForgotPage],
})
export class ForgotPageModule {}
