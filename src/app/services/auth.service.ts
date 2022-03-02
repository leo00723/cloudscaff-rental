import { Injectable } from '@angular/core';
import {
  Auth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Store } from '@ngxs/store';
import { GetUser } from 'src/app/shared/user/user.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logoutF = false;
  constructor(private auth: Auth, private store: Store) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.store.dispatch(new GetUser(user.uid));
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
