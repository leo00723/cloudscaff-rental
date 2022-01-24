import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [ComponentsModule, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}
