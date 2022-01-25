import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEstimatePageRoutingModule } from './add-estimate-routing.module';

import { AddEstimatePage } from './add-estimate.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [ComponentsModule, AddEstimatePageRoutingModule],
  declarations: [AddEstimatePage],
})
export class AddEstimatePageModule {}
