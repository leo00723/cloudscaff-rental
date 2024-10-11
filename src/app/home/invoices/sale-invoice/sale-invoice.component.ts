import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShareDocumentComponent } from 'src/app/components/share-document/share-document.component';
import { Company } from 'src/app/models/company.model';
import { SaleInvoice } from 'src/app/models/sale-invoice.model';
import { Term } from 'src/app/models/term.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PdfService } from 'src/app/services/pdf.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-sale-invoice',
  templateUrl: './sale-invoice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleInvoiceComponent {
  @Input() set value(val: SaleInvoice) {
    if (val) {
      this.invoice = val;
    }
  }
  @Input() canDownload = false;
  @Input() showUploads = false;
  protected saving = false;
  protected loading = false;
  invoice: SaleInvoice;
  terms$: Observable<Term>;
  company: Company;
  private modalSvc = inject(ModalController);
  private store = inject(Store);
  private editSvc = inject(EditService);
  private notification = inject(NotificationService);
  private pdfSvc = inject(PdfService);

  constructor() {
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.terms$ = this.editSvc.getDocById(
      `company/${this.company.id}/terms`,
      'Invoice'
    );
  }

  accept() {
    this.notification.presentAlertConfirm(async () => {
      try {
        this.loading = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/sellInvoice`,
          this.invoice.id,
          { status: 'accepted' }
        );
        this.notification.toast('Successfully accepted invoice.', 'success');
      } catch (e) {
        this.notification.toast(
          'Something went wrong accepting invoice. Please try again',
          'danger'
        );
        console.log(e);
      } finally {
        this.loading = false;
      }
    });
  }

  voidEstimate() {
    this.notification.presentAlertConfirm(async () => {
      try {
        this.loading = true;
        await this.editSvc.updateDoc(
          `company/${this.company.id}/sellInvoice`,
          this.invoice.id,
          { status: 'void' }
        );
        this.notification.toast('Successfully voided invoice.', 'success');
      } catch (e) {
        this.notification.toast(
          'Something went wrong voiding invoice. Please try again',
          'danger'
        );
        console.log(e);
      } finally {
        this.loading = false;
      }
    });
  }

  close() {
    this.modalSvc.dismiss();
  }

  async download(terms: Term | null) {
    const pdf = await this.pdfSvc.generateSaleInvoice(
      this.invoice,
      this.company,
      terms
    );
    this.pdfSvc.handlePdf(pdf, this.invoice.code);
  }
  async share(terms: Term | null) {
    // const sharedEstimate = {
    //   estimate: this.invoice,
    //   company: this.company,
    //   terms,
    // };
    // const modal = await this.modalSvc.create({
    //   component: ShareDocumentComponent,
    //   componentProps: {
    //     data: {
    //       type: 'estimate',
    //       doc: sharedEstimate,
    //     },
    //   },
    //   showBackdrop: true,
    //   id: 'shareDocument',
    //   cssClass: 'accept',
    // });
    // return await modal.present();
  }
}
