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
    path: 'viewDismantle/:id',
    loadChildren: () =>
      import('./customer-dismantle/customer-dismantle.module').then(
        (m) => m.CustomerDismantlePageModule
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
