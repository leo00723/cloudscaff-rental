import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'estimates',
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
        path: 'addEstimate',
        loadChildren: () =>
          import('../add-estimate/add-estimate.module').then(
            (m) => m.AddEstimatePageModule
          ),
      },
      {
        path: 'editEstimate/:id',
        loadChildren: () =>
          import('../add-estimate/add-estimate.module').then(
            (m) => m.AddEstimatePageModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../settings/settings.module').then(
            (m) => m.SettingsPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
