import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { TutorialsPage } from './tutorials.page';
import { TutorialsPageRoutingModule } from './tutorials-routing.module';

@NgModule({
  imports: [ComponentsModule, TutorialsPageRoutingModule],
  declarations: [TutorialsPage],
})
export class TransportPageModule {}
