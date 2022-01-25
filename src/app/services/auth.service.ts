import { Injectable } from '@angular/core';
import {
  Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  collection,
  CollectionReference,
  doc,
  docData,
  DocumentData,
  Firestore,
} from '@angular/fire/firestore';
import { authState } from 'rxfire/auth';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any | null> = EMPTY;
  company$ = new BehaviorSubject<Company>(null);

  constructor(private auth: Auth, private firestore: Firestore) {
    this.checkUser();
  }

  checkUser() {
    if (this.auth) {
      this.user$ = authState(this.auth).pipe(
        switchMap((user) => {
          if (user) {
            return this.getUserProfile(user.uid);
          } else {
            return of(null);
          }
        })
      );
    }
  }

  getCompany(id: string) {
    return docData(doc(this.firestore, `company/${id}`), {
      idField: 'id',
    }) as Observable<Company>;
  }

  getUserProfile(uid: string) {
    const currentUser$ = docData(doc(this.firestore, `users/${uid}`), {
      idField: 'id',
    });
    return currentUser$;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    this.company$.next(null);
    return await signOut(this.auth);
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }
}
