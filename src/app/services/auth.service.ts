import { Injectable } from '@angular/core';
import {
  Auth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetUser } from 'src/app/shared/user/user.actions';
import { Navigate } from '../shared/router.state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn = false;
  constructor(
    private auth: Auth,
    private store: Store,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.loggedIn = true;
        this.store.dispatch(new GetUser(user.uid));
        this.store.dispatch(new Navigate('/dashboard/sites'));
      } else if (this.loggedIn) {
        this.store.dispatch(new Navigate('/login'));
      }
    });
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
}
