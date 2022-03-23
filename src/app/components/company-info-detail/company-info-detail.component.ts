import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-company-info-detail',
  templateUrl: './company-info-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyInfoDetailComponent {
  @Input() customer: Customer;
  @Select() company$: Observable<Company>;
}
