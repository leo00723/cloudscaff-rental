import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerStatementPage } from './customer-statement.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerStatementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerStatementPageRoutingModule {}
