import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Company } from '../models/company.model';

@Component({
  templateUrl: './trial-ended.page.html',
})
export class TrialEndedPage implements OnInit {
  @Select() company$: Company;
  constructor(private store: Store) {}

  ngOnInit(): void {}
}
