import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';
import { SetSite } from '../sites/state/sites.actions';

@Component({
  selector: 'app-view-scaffold',
  templateUrl: './view-scaffold.page.html',
})
export class ViewScaffoldPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  scaffold$: Observable<Scaffold>;
  active = 'overview';
  ids = [];
  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.scaffold$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/scaffolds`, this.ids[2])
      .pipe(
        tap((site: Scaffold) => {
          if (!site)
            this.masterSvc
              .store()
              .dispatch(
                new Navigate(`/dashboard/site/${this.ids[0]}-${this.ids[1]}`)
              );
          // this.masterSvc.store().dispatch(new SetSite(site));
        })
      ) as Observable<Scaffold>;
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
  ngOnInit() {}
}
