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
      title: "Estimate T's & C's",
      description: "Here you update T's & C's for your estimates.",
      path: 'Estimate',
    },
    {
      title: "Scaffold T's & C's",
      description: "Here you update T's & C's for your scaffolds.",
      path: 'Scaffold',
    },
    {
      title: "Handover T's & C's",
      description: "Here you update T's & C's for your handovers.",
      path: 'Handover',
    },
    {
      title: "Inspection T's & C's",
      description: "Here you update T's & C's for your inspections.",
      path: 'Inspection',
    },
    {
      title: "Invoice T's & C's",
      description: "Here you update T's & C's for your invoices.",
      path: 'Invoice',
    },
  ];
  terms$: Observable<Term[] | any>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {
    this.init();
  }

  async editTerms(
    id: string,
    data: { company: Company; user: any; terms: Term[] }
  ) {
    let term = null;
    if (data.terms) {
      term = data.terms.find((t) => {
        return t.id === id;
      });
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
        company: data.company,
        user: data.user,
      },
      showBackdrop: false,
      id,
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  init() {
    this.terms$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyId(`company/${company.id}/terms`);
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
  }
}
