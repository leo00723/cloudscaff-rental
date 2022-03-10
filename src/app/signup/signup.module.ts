import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SignupPage } from './signup.page';

@NgModule({
  imports: [ComponentsModule, SignupPageRoutingModule],
  declarations: [SignupPage],
})
export class SignupPageModule {}
