import { NgModule } from '@angular/core';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
const redirectUnauthorized = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorized = () => redirectLoggedInTo(['/dashboard/sites']);

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
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
