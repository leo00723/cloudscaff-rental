import { NgModule } from '@angular/core';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { TrialEndedPage } from './trial-ended/trial-ended.page';
const redirectUnauthorized = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorized = () => redirectLoggedInTo(['/dashboard/sites']);

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'trial-ended',
    component: TrialEndedPage,
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectAuthorized },
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.module').then((m) => m.SignupPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectAuthorized },
  },
  {
    path: 'forgot',
    loadChildren: () =>
      import('./forgot/forgot.module').then((m) => m.ForgotPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectAuthorized },
  },
  {
    path: 'reset',
    loadChildren: () =>
      import('./reset/reset.module').then((m) => m.ResetPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectAuthorized },
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorized },
  },
  {
    path: 'viewEstimate/:id',
    loadChildren: () =>
      import('./customer-estimate/customer-estimate.module').then(
        (m) => m.CustomerEstimatePageModule
      ),
  },
  {
    path: 'viewBulkEstimate/:id',
    loadChildren: () =>
      import('./customer-bulk-estimate/customer-bulk-estimate.module').then(
        (m) => m.CustomerBulkEstimatePageModule
      ),
  },
  {
    path: 'viewInventoryEstimate/:id',
    loadChildren: () =>
      import(
        './customer-inventory-estimate/customer-inventory-estimate.module'
      ).then((m) => m.CustomerInventoryEstimatePageModule),
  },
  {
    path: 'viewInvoice/:id',
    loadChildren: () =>
      import('./customer-invoice/customer-invoice.module').then(
        (m) => m.CustomerInvoicePageModule
      ),
  },
  {
    path: 'viewCredit/:id',
    loadChildren: () =>
      import('./customer-credit/customer-credit.module').then(
        (m) => m.CustomerCreditPageModule
      ),
  },
  {
    path: 'viewModification/:id',
    loadChildren: () =>
      import('./customer-modification/customer-modification.module').then(
        (m) => m.CustomerModificationPageModule
      ),
  },
  {
    path: 'viewInspection/:id',
    loadChildren: () =>
      import('./customer-inspection/customer-inspection.module').then(
        (m) => m.CustomerInspectionPageModule
      ),
  },
  {
    path: 'viewHandover/:id',
    loadChildren: () =>
      import('./customer-handover/customer-handover.module').then(
        (m) => m.CustomerHandoverPageModule
      ),
  },
  {
    path: 'viewStatement/:id',
    loadChildren: () =>
      import('./customer-statement/customer-statement.module').then(
        (m) => m.CustomerStatementPageModule
      ),
  },
  {
    path: 'viewRegister/:id',
    loadChildren: () =>
      import('./customer-register/customer-register.module').then(
        (m) => m.CustomerRegisterPageModule
      ),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/dashboard/sites',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
