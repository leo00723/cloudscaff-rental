import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CompanyPageRoutingModule } from './company-routing.module';
import { CompanyPage } from './company.page';

@NgModule({
  imports: [ComponentsModule, CompanyPageRoutingModule],
  declarations: [CompanyPage],
})
export class CompanyPageModule {}
