import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  collectionGroup,
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
  writeBatch,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private firestore: Firestore, private functions: Functions) {}

  //---- GENERATE CODE FOR ANY DOCUMENT ----
  generateDocCode(counter: number, prefix: string) {
    const yearCode = new Date().toLocaleDateString('en', { year: '2-digit' });
    const total = counter ?? 0;
    const returnNumber = (total + 1).toString().padStart(6, '0');

    return `${prefix}${yearCode}${returnNumber}`;
  }
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
          if (data.date) {
            return { ...data, date: data.date.toDate() };
          }
          return data;
        }
      })
    );
  }
  getCollection(collectionPath: string) {
    return collectionData(this.collectionRef(collectionPath), {
      idField: 'id',
    }).pipe(
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
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
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
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
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
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
      map((data: any) =>
        data.map((d: any) => {
          if (d.date && d.date.toDate) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
    ) as Observable<any[]>;
  }

  getCollectionWhereWhereAndOrder(
    collectionPath: string,
    field1: string,
    whereFilter1: WhereFilterOp,
    value1: any,
    field2: string,
    whereFilter2: WhereFilterOp,
    value2: any,
    orderField: string,
    direction: OrderByDirection
  ) {
    return collectionData(
      query(
        this.collectionRef(collectionPath),
        where(field1, whereFilter1, value1),
        where(field2, whereFilter2, value2),
        orderBy(orderField, direction)
      ),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
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
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
    ) as Observable<any[]>;
  }

  getCollectionGroupWhere(
    collectionName: string,
    field: string,
    whereFilter: WhereFilterOp,
    value: any
  ) {
    return collectionData(
      query(
        collectionGroup(this.firestore, collectionName),
        where(field, whereFilter, value)
      ),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) =>
        data.map((d: any) => {
          if (d.date) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
    ) as Observable<any[]>;
  }

  getCollectionGroup(collectionName: string) {
    return collectionData(
      query(collectionGroup(this.firestore, collectionName)),
      {
        idField: 'id',
      }
    ).pipe(
      map((data: any) =>
        data.map((d: any) => {
          if (d.date.toDate) {
            return { ...d, date: d.date.toDate() };
          }
          return d;
        })
      )
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

  docRef(collectionName: string, id: string) {
    return doc(this.firestore, `${collectionName}/${id}`);
  }
  collectionRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }

  batch() {
    return writeBatch(this.firestore);
  }
}
