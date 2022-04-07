import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Estimate } from '../models/estimate.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-estimate',
  templateUrl: './customer-estimate.page.html',
})
export class CustomerEstimatePage {
  company$: Observable<Company>;
  estimate$: Observable<Estimate>;
  terms$: Observable<Term>;

  ids: string[];
  constructor(
    private editService: EditService,
    private activatedRoute: ActivatedRoute,
    private pdf: PdfService,
    private store: Store,
    private notificationSvc: NotificationService
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.terms$ = this.editService.getDocById(
      `company/${this.ids[0]}/terms`,
      'Estimate'
    );
    this.company$ = this.editService.getDocById(`company`, this.ids[0]).pipe(
      tap((company: Company) => {
        if (!company) this.store.dispatch(new Navigate('/login'));
      })
    ) as Observable<Company>;
    this.estimate$ = this.editService
      .getDocById(`company/${this.ids[0]}/estimates`, this.ids[1])
      .pipe(
        tap((estimate: Estimate) => {
          if (!estimate) this.store.dispatch(new Navigate('/login'));
        })
      ) as Observable<Estimate>;
  }

  async download(terms: Term | null, estimate: Estimate, company: Company) {
    const pdf = await this.pdf.generateEstimate(estimate, company, terms);
    if (!this.pdf.handlePdf(pdf, estimate.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
