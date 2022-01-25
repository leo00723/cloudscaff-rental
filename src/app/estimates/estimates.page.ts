import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SortType } from '@swimlane/ngx-datatable';
export interface Data {
  movies: string;
}
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
  styleUrls: ['./estimates.page.scss'],
})
export class EstimatesPage implements OnInit {
  public data: Data;
  public columns: any;
  public rows: any;
  sortType: SortType.multi;
  constructor(private http: HttpClient) {
    this.columns = [{ name: 'Name' }, { name: 'Company' }, { name: 'Genre' }];

    this.http.get<Data>('../../assets/movies.json').subscribe((res) => {
      console.log(res);
      this.rows = res.movies;
    });
  }

  ngOnInit() {}
}
