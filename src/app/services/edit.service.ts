import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { addDoc, deleteDoc } from 'firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private firestore: Firestore) {}

  //----ADD FUNCTIONS----

  addDocument(collectionName: string, data) {
    return addDoc(this.collectionRef(collectionName), { ...data });
  }

  //----SET FUNCTIONS----

  setDoc(collectionName: string, data) {
    return setDoc(this.docRef(collectionName, this.createUID(collectionName)), {
      ...data,
    });
  }

  //----UPDATE FUNCTIONS----

  updateDoc(collectionName: string, id: string, data) {
    return updateDoc(this.docRef(collectionName, id), { ...data });
  }

  //----GET FUNCTIONS----

  getDocById(collectionName: string, id: string) {
    return docData(this.docRef(collectionName, id), {
      idField: 'id',
    });
  }
  getDocsByCompanyId(collectionPath: string) {
    return collectionData(this.collectionRef(collectionPath), {
      idField: 'id',
    }) as Observable<any[]>;
  }

  //----DELETE FUNCTIONS----
  deleteDocById(collectionName: string, id: string) {
    return deleteDoc(this.docRef(collectionName, id));
  }

  //----UTILITY FUNCTIONS----

  createUID(collectionName: string) {
    const docRef = doc<any>(
      this.collectionRef(collectionName)
    ) as DocumentReference<any>;
    return docRef.id;
  }
  private docRef(collectionName: string, id: string) {
    return doc(this.firestore, `${collectionName}/${id}`);
  }
  private collectionRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }
}
