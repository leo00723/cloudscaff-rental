import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentReference,
  Firestore,
  orderBy,
  OrderByDirection,
  query,
  setDoc,
  where,
  WhereFilterOp,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private firestore: Firestore, private functions: Functions) {}

  //----ADD FUNCTIONS----

  addDocument(collectionName: string, data) {
    return addDoc(this.collectionRef(collectionName), { ...data });
  }

  //----SET FUNCTIONS----

  setDoc(collectionName: string, data, id?: string) {
    return setDoc(
      this.docRef(collectionName, id ? id : this.createUID(collectionName)),
      {
        ...data,
      }
    );
  }

  //----UPDATE FUNCTIONS----

  updateDoc(collectionName: string, id: string, data) {
    return setDoc(
      this.docRef(collectionName, id),
      { ...data },
      { merge: true }
    );
  }

  //----GET FUNCTIONS----

  getDocById(collectionName: string, id: string) {
    return docData(this.docRef(collectionName, id), {
      idField: 'id',
    }).pipe(
      map((data: any) => {
        if (data) {
          if (data.date) return { ...data, date: data.date.toDate() };
          return data;
        }
      })
    );
  }
  getCollection(collectionPath: string) {
    return collectionData(this.collectionRef(collectionPath), {
      idField: 'id',
    }).pipe(
      map((data: any) => {
        return data.map((d: any) => {
          if (d.date) return { ...d, date: d.date.toDate() };
          return d;
        });
      })
    ) as Observable<any[]>;
  }

  getCollectionOrdered(
    collectionPath: string,
    orderField: string,
    direction: OrderByDirection
  ) {
    return collectionData(
      query(this.collectionRef(collectionPath), orderBy(orderField, direction)),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) => {
        return data.map((d: any) => {
          if (d.date) return { ...d, date: d.date.toDate() };
          return d;
        });
      })
    ) as Observable<any[]>;
  }
  getCollectionWhere(
    collectionPath: string,
    field: string,
    whereFilter: WhereFilterOp,
    value: any
  ) {
    return collectionData(
      query(
        this.collectionRef(collectionPath),
        where(field, whereFilter, value)
      ),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) => {
        return data.map((d: any) => {
          if (d.date) return { ...d, date: d.date.toDate() };
          return d;
        });
      })
    ) as Observable<any[]>;
  }

  getCollectionWhereAndOrder(
    collectionPath: string,
    field: string,
    whereFilter: WhereFilterOp,
    value: any,
    orderField: string,
    direction: OrderByDirection
  ) {
    return collectionData(
      query(
        this.collectionRef(collectionPath),
        where(field, whereFilter, value),
        orderBy(orderField, direction)
      ),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) => {
        return data.map((d: any) => {
          if (d.date) return { ...d, date: d.date.toDate() };
          return d;
        });
      })
    ) as Observable<any[]>;
  }

  getCollectionWhereAndDateRangeAndOrder(
    collectionPath: string,
    field: string,
    whereFilter: WhereFilterOp,
    value: any,
    orderField: string,
    direction: OrderByDirection,
    dateField: string,
    startDate: Date,
    endDate: Date
  ) {
    return collectionData(
      query(
        this.collectionRef(collectionPath),
        where(field, whereFilter, value),
        where(dateField, '>=', startDate),
        where(dateField, '<=', endDate),
        orderBy(orderField, direction)
      ),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) => {
        return data.map((d: any) => {
          if (d.date) return { ...d, date: d.date.toDate() };
          return d;
        });
      })
    ) as Observable<any[]>;
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

  async callFunction(name: string, data: any) {
    const ref = httpsCallable(this.functions, name);
    return await ref({ ...data });
  }

  private docRef(collectionName: string, id: string) {
    return doc(this.firestore, `${collectionName}/${id}`);
  }
  private collectionRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }
}
