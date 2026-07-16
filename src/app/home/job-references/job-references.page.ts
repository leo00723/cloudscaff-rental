import { Component, OnInit } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { JobReference } from 'src/app/models/jr.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { JobReferenceComponent } from '../view-site/job-reference/job-reference.component';

@Component({
  selector: 'app-job-references',
  templateUrl: './job-references.page.html',
})
export class JobReferencesPage implements OnInit {
  jobReferences$: Observable<JobReference[]>;

  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.jobReferences$ = this.masterSvc
      .store()
      .select(CompanyState.company)
      .pipe(
        switchMap((company: Company) => {
          if (!company?.id) {
            return of([]);
          }

          return this.masterSvc
            .edit()
            .getCollectionFiltered(`company/${company.id}/jobReferences`, [
              where('status', '==', 'pending'),
            ]) as Observable<JobReference[]>;
        }),
        map((jobReferences) =>
          [...jobReferences].sort((a, b) =>
            (b.code || '').localeCompare(a.code || '')
          )
        )
      );
  }

  async viewJobReference(jobReference: JobReference) {
    const modal = await this.masterSvc.modal().create({
      component: JobReferenceComponent,
      componentProps: { value: jobReference },
      showBackdrop: false,
      id: 'viewJobReference',
      cssClass: 'fullscreen',
    });

    return await modal.present();
  }

  viewSites() {
    this.masterSvc.router().navigateByUrl('/dashboard/sites');
  }
}
