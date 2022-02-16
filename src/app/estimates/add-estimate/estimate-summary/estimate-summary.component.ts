import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Company } from 'src/app/models/company.model';

@Component({
  selector: 'app-estimate-summary',
  templateUrl: './estimate-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateSummaryComponent implements OnInit {
  @Input() company: Company;
  @Input() estimate: any;
  constructor() {}

  ngOnInit() {}
}
