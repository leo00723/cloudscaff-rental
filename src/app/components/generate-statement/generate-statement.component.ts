import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of, take } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Credit } from 'src/app/models/credit.model';
import { Customer } from 'src/app/models/customer.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Payment } from 'src/app/models/payment.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-generate-statement',
  templateUrl: './generate-statement.component.html',
  styles: [],
})
export class GenerateStatementComponent implements OnInit {
  form: FormGroup;
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  isLoading = false;
  viewStatement = false;
  statement$: Observable<any>;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
  }

  ngOnInit(): void {
    this.form = this.masterSvc.fb().group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      customer: ['', Validators.required],
    });
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  generate() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.isLoading = true;
      const data = this.form.value;
      const invoices = this.masterSvc
        .edit()
        .getCollectionWhereAndDateRangeAndOrder(
          `company/${this.company.id}/invoices`,
          'customer.id',
          '==',
          data.customer.id,
          'date',
          'desc',
          'date',
          new Date(data.startDate),
          new Date(data.endDate)
        ) as Observable<Invoice[]>;
      invoices.subscribe();
      const payments = this.masterSvc
        .edit()
        .getCollectionWhereAndDateRangeAndOrder(
          `company/${this.company.id}/payments`,
          'customerId',
          '==',
          data.customer.id,
          'date',
          'desc',
          'date',
          new Date(data.startDate),
          new Date(data.endDate)
        ) as Observable<Payment[]>;
      const credits = this.masterSvc
        .edit()
        .getCollectionWhereAndDateRangeAndOrder(
          `company/${this.company.id}/credits`,
          'customer.id',
          '==',
          data.customer.id,
          'date',
          'desc',
          'date',
          new Date(data.startDate),
          new Date(data.endDate)
        ) as Observable<Credit[]>;
      this.statement$ = forkJoin<{
        customer: Observable<Customer>;
        company: Observable<Company>;
        invoices: Observable<Invoice[]>;
        payments: Observable<Payment[]>;
        credits: Observable<Credit[]>;
        dates: Observable<{ startDate: any; endDate: any; date: Date }>;
      }>({
        customer: of(data.customer),
        company: of(this.company),
        invoices: invoices.pipe(take(1)),
        payments: payments.pipe(take(1)),
        credits: credits.pipe(take(1)),
        dates: of({
          startDate: data.startDate,
          endDate: data.endDate,
          date: new Date(),
        }),
      });
      this.isLoading = false;
      this.viewStatement = true;
    });
  }
}
