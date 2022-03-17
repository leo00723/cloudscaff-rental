import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { ViewScaffoldPageRoutingModule } from './view-scaffold-routing.module';
import { ViewScaffoldPage } from './view-scaffold.page';

@NgModule({
  imports: [ComponentsModule, ViewScaffoldPageRoutingModule],
  declarations: [ViewScaffoldPage],
})
export class ViewScaffoldPageModule {}
