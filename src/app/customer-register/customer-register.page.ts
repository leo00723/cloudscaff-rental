import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';
import { Observable, tap } from 'rxjs';
import { Scaffold } from '../models/scaffold.model';
import { orderBy, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.page.html',
})
export class CustomerRegisterPage implements OnInit {
  ids: string[];
  register$: any;
  scaffolds$: Observable<Scaffold[]>;
  constructor(
    private editService: EditService,
    private activatedRoute: ActivatedRoute,
    private pdf: PdfService,
    private notificationSvc: NotificationService,
    private store: Store
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
  }

  ngOnInit(): void {
    if (this.ids.length !== 2) {
      this.notificationSvc.toast('Document not found!', 'warning', 3000);
      this.store.dispatch(new Navigate('/login'));
    } else {
      this.scaffolds$ = this.editService
        .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
          where('siteId', '==', this.ids[1]),
          orderBy('date', 'desc'),
          orderBy('latestHandover', 'asc'),
        ])
        .pipe(
          tap((data: Scaffold[]) => {
            if (!data) {
              this.notificationSvc.toast(
                'Document not found!',
                'warning',
                3000
              );
              this.store.dispatch(new Navigate('/login'));
            }
          })
        ) as Observable<Scaffold[]>;
    }
  }
}
