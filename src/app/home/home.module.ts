import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [ComponentsModule, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}
