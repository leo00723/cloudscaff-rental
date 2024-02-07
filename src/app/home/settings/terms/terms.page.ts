import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { Term } from 'src/app/models/term.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { AddTermsComponent } from './add-terms/add-terms.component';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPage {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  terms = [
    {
      title: `Estimate T's & C's`,
      description: `Here you update T's & C's for your estimates.`,
      path: 'Estimate',
    },
    {
      title: `Scaffold T's & C's`,
      description: `Here you update T's & C's for your scaffolds.`,
      path: 'Scaffold',
    },
    {
      title: `Handover T's & C's`,
      description: `Here you update T's & C's for your handovers.`,
      path: 'Handover',
    },
    {
      title: `Inspection T's & C's`,
      description: `Here you update T's & C's for your inspections.`,
      path: 'Inspection',
    },
    {
      title: `Invoice T's & C's`,
      description: `Here you update T's & C's for your invoices.`,
      path: 'Invoice',
    },
    {
      title: `Credit Note T's & C's`,
      description: `Here you update T's & C's for your credit notes.`,
      path: 'Credit',
    },
    {
      title: `Payment Application T's & C's`,
      description: `Here you update T's & C's for your payment applications.`,
      path: 'Payment',
    },
  ];
  terms$: Observable<Term[] | any>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {
    this.init();
  }

  async editTerms(id: string, terms: Term[]) {
    let term = null;
    if (terms) {
      term = terms.find((t) => t.id === id);
    }
    const modal = await this.masterSvc.modal().create({
      component: AddTermsComponent,
      componentProps: {
        term: term
          ? term
          : {
              id,
              terms: '',
            },
      },
      showBackdrop: false,
      id,
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  removeBilling(company: Company, page: string): boolean {
    const billingPages = ['Estimate', 'Invoice', 'Credit', 'Payment'];
    return !billingPages.includes(page) || !company.removeBilling;
  }

  init() {
    this.terms$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getCollection(`company/${company.id}/terms`);
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
  }
}
