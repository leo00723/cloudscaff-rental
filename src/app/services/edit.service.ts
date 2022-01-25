import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { traceUntilFirst } from '@angular/fire/performance';
import { collectionData, docData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private firestore: Firestore) {}

  // SET FUNCTIONS
  setCompany(company: Company) {
    return setDoc(this.docRef('company', this.createUID('company')), {
      ...company,
    });
  }

  createUID(collectionName: string) {
    const docRef = doc<any>(
      this.collectionRef(collectionName)
    ) as DocumentReference<any>;
    return docRef.id;
  }

  // UPDATE FUNCTIONS
  updateCompany(id: string, company: Company) {
    return updateDoc(this.docRef('company', id), { ...company });
  }

  //GET FUNCTIONS

  getCompany(id: string) {
    return docData(this.docRef('company', id), {
      idField: 'id',
    }) as Observable<Company>;
  }
  getCustomers(id: string) {
    return collectionData(
      query(this.collectionRef('customers'), where('company', '==', id)),
      { idField: 'id' }
    ) as Observable<any[]>;
  }

  private docRef(collectionName: string, id: string) {
    return doc(this.firestore, `${collectionName}/${id}`);
  }
  private collectionRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }
}
