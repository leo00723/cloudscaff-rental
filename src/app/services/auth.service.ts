import { Injectable } from '@angular/core';
import {
  Auth,
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetUser } from 'src/app/shared/user/user.actions';
import { GetCompany } from '../shared/company/company.actions';
import { CompanyState } from '../shared/company/company.state';
import { Navigate } from '../shared/router.state';
import { UserState } from '../shared/user/user.state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn = false;
  constructor(private auth: Auth, private store: Store) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.loggedIn = true;
        const company = (await user.getIdTokenResult()).claims
          .company as string;
        this.store.dispatch([new GetUser(user.uid), new GetCompany(company)]);
      } else if (this.loggedIn) {
        this.store.dispatch(new Navigate('/login'));
      }
    });
  }

  getUser() {
    return this.store.selectSnapshot(UserState.user);
  }
  getCompany() {
    return this.store.selectSnapshot(CompanyState.company);
  }

  async login({ email, password }) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth);
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  async newPassword(oobCode: string, password: string) {
    return await confirmPasswordReset(this.auth, oobCode, password);
  }
}
