import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-condensed',
  templateUrl: './header-condensed.component.html',
})
export class HeaderCondensedComponent implements OnInit {
  @Input() title = '';

  constructor() {}

  ngOnInit() {}
}
