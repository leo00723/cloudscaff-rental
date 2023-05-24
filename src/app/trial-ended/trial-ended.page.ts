import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Company } from '../models/company.model';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './trial-ended.page.html',
})
export class TrialEndedPage {
  @Select() company$: Observable<Company>;
}
