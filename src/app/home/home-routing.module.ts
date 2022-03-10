import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sites',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'onboarding',
        loadChildren: () =>
          import('./onboarding/onboarding.module').then(
            (m) => m.OnboardingPageModule
          ),
      },
      {
        path: 'overview',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },
      {
        path: 'estimates',
        loadChildren: () =>
          import('./estimates/estimates.module').then(
            (m) => m.EstimatesPageModule
          ),
      },
      {
        path: 'sites',
        loadChildren: () =>
          import('./sites/sites.module').then((m) => m.SitesPageModule),
      },
      {
        path: 'site/:id',
        loadChildren: () =>
          import('./sites/view-site/view-site.module').then(
            (m) => m.ViewSitePageModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then(
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
