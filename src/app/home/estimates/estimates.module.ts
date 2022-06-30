import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from '../../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { EstimatesState } from './state/estimate.state';

@NgModule({
  imports: [
    ComponentsModule,
    EstimatesPageRoutingModule,
    NgxsModule.forFeature([EstimatesState]),
  ],
  declarations: [EstimatesPage],
})
export class EstimatesPageModule {}
