import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from 'src/app/components/components.module';
import { CompanyState } from 'src/app/shared/company/company.state';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [ComponentsModule, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}
