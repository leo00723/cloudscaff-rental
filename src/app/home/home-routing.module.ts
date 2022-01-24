import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },
      {
        path: 'estimates',
        loadChildren: () =>
          import('../estimates/estimates.module').then(
            (m) => m.EstimatesPageModule
          ),
      },
      {
        path: 'company/:id',
        loadChildren: () =>
          import('../company/company.module').then((m) => m.CompanyPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
