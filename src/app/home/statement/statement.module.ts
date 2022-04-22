import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { StatementPageRoutingModule } from './statement-routing.module';
import { StatementPage } from './statement.page';

@NgModule({
  imports: [ComponentsModule, StatementPageRoutingModule],
  declarations: [StatementPage],
})
export class StatementPageModule {}
