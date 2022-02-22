import { Injectable } from '@angular/core';
import {
  Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { authState } from 'rxfire/auth';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  of,
  Subscription,
  timer,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any | null>;
  company$ = new BehaviorSubject<Company>(null);
  subs = new Subscription();
  constructor(private auth: Auth, private firestore: Firestore) {
    this.subs.add(this.checkUser());
    this.subs.add(this.init());
  }

  init() {
    this.user$
      .pipe(
        switchMap((user) => {
          if (user) {
            return this.getCompany(user.company);
          } else {
            return timer(1);
          }
        })
      )
      .subscribe((company: Company) => {
        this.company$.next(company);
      });
  }

  private checkUser() {
    if (this.auth) {
      this.user$ = authState(this.auth).pipe(
        switchMap((user) => {
          if (user) {
            return this.getUserProfile(user.uid);
          } else {
            return timer(1);
          }
        })
      );
    }
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

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth).then(() => {
      this.company$.next(null);
      this.company$.complete();
      this.subs.unsubscribe();
    });
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }
}
