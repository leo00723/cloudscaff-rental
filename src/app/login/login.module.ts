import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

@NgModule({
  imports: [ComponentsModule, LoginPageRoutingModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
