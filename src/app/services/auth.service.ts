import { Injectable } from '@angular/core';
import {
  Auth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { Observable, timer } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any | null> = timer(1);
  company$: Observable<any | null>;
  uid = '';
  logoutF = false;
  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        try {
          this.uid = user.uid;
          this.user$ = this.getUserProfile(this.uid);
          this.init();
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  private init() {
    this.company$ = this.user$.pipe(
      filter(Boolean),
      switchMap((user: any) => {
        return this.getCompany(user.company);
      })
    );
  }

  private getCompany(id: string) {
    return docData(doc(this.firestore, `company/${id}`), {
      idField: 'id',
    }) as Observable<Company>;
  }

  private getUserProfile(uid: string) {
    const currentUser$ = docData(doc(this.firestore, `users/${uid}`), {
      idField: 'id',
    });
    return currentUser$;
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
