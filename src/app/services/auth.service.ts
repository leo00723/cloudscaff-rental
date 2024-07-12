import { Injectable } from '@angular/core';
import {
  Auth,
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Store } from '@ngxs/store';
import { GetUser } from 'src/app/shared/user/user.actions';
import { CompanyState } from '../shared/company/company.state';
import { GetNotifications } from '../shared/notifications/notifications.actions';
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
        // const { claims } = await user.getIdTokenResult();
        // console.log(claims);
        this.loggedIn = true;
        this.store.dispatch([
          new GetUser(user.uid),
          new GetNotifications(user.uid),
        ]);
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
