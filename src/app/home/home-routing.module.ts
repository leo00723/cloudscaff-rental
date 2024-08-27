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
        path: 'view',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },
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
        path: 'enquiries',
        loadChildren: () =>
          import('./enquiries/enquiries.module').then(
            (m) => m.EnquiriesPageModule
          ),
      },
      {
        path: 'handovers',
        loadChildren: () =>
          import('./handovers/handovers.module').then(
            (m) => m.HandoversPageModule
          ),
      },
      {
        path: 'site-instructions',
        loadChildren: () =>
          import('./site-instructions/site-instructions.module').then(
            (m) => m.SiteInstructionsPageModule
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
          import('./view-site/view-site.module').then(
            (m) => m.ViewSitePageModule
          ),
      },
      {
        path: 'scaffold/:id',
        loadChildren: () =>
          import('./view-scaffold/view-scaffold.module').then(
            (m) => m.ViewScaffoldPageModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then(
            (m) => m.SettingsPageModule
          ),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/inventory.module').then(
            (m) => m.InventoryPageModule
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./notifications/notifications.module').then(
            (m) => m.NotificationsPageModule
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
