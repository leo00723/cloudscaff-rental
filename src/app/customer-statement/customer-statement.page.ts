import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { SharedStatement } from '../models/sharedStatement.model';
import { Statement } from '../models/statement.mode';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-statement',
  templateUrl: './customer-statement.page.html',
})
export class CustomerStatementPage {
  statement$: Observable<SharedStatement>;
  ids: string[];
  sent = false;
  constructor(
    private editService: EditService,
    private activatedRoute: ActivatedRoute,
    private pdf: PdfService,
    private notificationSvc: NotificationService,
    private store: Store
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    if (this.ids.length !== 2) {
      this.notificationSvc.toast('Document not found!', 'warning', 3000);
      this.store.dispatch(new Navigate('/login'));
    }
    this.statement$ = this.editService
      .getDocById('sharedStatements', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedStatement) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.statement.customer.name} has viewed your statement.`,
                    message: '',
                    btnText: 'View Statement',
                    link: `https://app.cloudscaff.com/viewStatement/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.statement.customer.name} viewed the statement`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedStatements', data.id, {
                viewed: true,
              });
            }
          } else {
            this.notificationSvc.toast('Document not found!', 'warning', 3000);
            this.store.dispatch(new Navigate('/login'));
          }
        })
      );
  }

  async download(terms: Term | null, statement: Statement, company: Company) {
    const pdf = await this.pdf.generateStatement(statement, company, terms);
    if (!this.pdf.handlePdf(pdf, statement.dates.date)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
