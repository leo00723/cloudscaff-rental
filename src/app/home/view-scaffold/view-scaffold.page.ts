import { Component, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { AddCreditComponent } from 'src/app/components/add-credit/add-credit.component';
import { AddHandoverComponent } from 'src/app/components/add-handover/add-handover.component';
import { AddInspectionComponent } from 'src/app/components/add-inspection/add-inspection.component';
import { AddInvoiceComponent } from 'src/app/components/add-invoice/add-invoice.component';
import { AddModificationComponent } from 'src/app/components/add-modification/add-modification.component';
import { AddPaymentComponent } from 'src/app/components/add-payment/add-payment.component';
import { DismantleSummaryComponent } from 'src/app/components/dismantle-summary/dismantle-summary.component';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { InspectionSummaryComponent } from 'src/app/components/inspection-summary/inspection-summary.component';
import { ViewInvoiceComponent } from 'src/app/components/view-invoice/view-invoice.component';
import { ViewModificationComponent } from 'src/app/components/view-modification/view-modification.component';
import { Company } from 'src/app/models/company.model';
import { Credit } from 'src/app/models/credit.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Modification } from 'src/app/models/modification.model';
import { Payment } from 'src/app/models/payment.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';

@Component({
  selector: 'app-view-scaffold',
  templateUrl: './view-scaffold.page.html',
})
export class ViewScaffoldPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  scaffold$: Observable<Scaffold>;
  inspections$: Observable<Inspection[]>;
  handovers$: Observable<Handover[]>;
  dismantles$: Observable<Handover[]>;
  modifications$: Observable<Modification[]>;
  invoices$: Observable<Invoice[]>;
  payments$: Observable<Payment[]>;
  credits$: Observable<Credit[]>;
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
          if (!site) {
            this.masterSvc
              .store()
              .dispatch(
                new Navigate(`/dashboard/site/${this.ids[0]}-${this.ids[1]}`)
              );
          }
        })
      ) as Observable<Scaffold>;
    this.inspections$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/inspections`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Inspection[]>;
    this.handovers$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/handovers`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Handover[]>;
    this.dismantles$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/dismantles`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Handover[]>;
    this.modifications$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/modifications`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Modification[]>;
    this.invoices$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/invoices`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Invoice[]>;
    this.payments$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/payments`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Payment[]>;
    this.credits$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/credits`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Credit[]>;
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
  ngOnInit() {}

  async addInspection(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddInspectionComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addInspection',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addHandover(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddHandoverComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addHandover',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addModification(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddModificationComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addModification',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addInvoice(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddInvoiceComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addInvoice',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addCredit(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddCreditComponent,
      componentProps: {
        scaffoldValue: scaffold,
      },
      showBackdrop: false,
      id: 'addCredit',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewInspection(inspection: Inspection) {
    const modal = await this.masterSvc.modal().create({
      component: InspectionSummaryComponent,
      componentProps: {
        inspection,
      },
      showBackdrop: false,
      id: 'viewInspection',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewHandover(handover: Handover) {
    const modal = await this.masterSvc.modal().create({
      component: HandoverSummaryComponent,
      componentProps: {
        handover,
      },
      showBackdrop: false,
      id: 'viewHandover',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewDismantle(dismantle: Handover) {
    const modal = await this.masterSvc.modal().create({
      component: DismantleSummaryComponent,
      componentProps: {
        dismantle,
      },
      showBackdrop: false,
      id: 'viewDismantle',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewModification(modification: Modification, scaffold: Scaffold) {
    if (modification.status === 'pending') {
      const modal = await this.masterSvc.modal().create({
        component: AddModificationComponent,
        componentProps: {
          value: scaffold,
          modification,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editModification',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      const modal = await this.masterSvc.modal().create({
        component: ViewModificationComponent,
        componentProps: {
          modification,
        },
        showBackdrop: false,
        id: 'viewModification',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    }
  }
  async viewInvoice(invoice: Invoice, scaffold: Scaffold) {
    if (
      invoice.status.startsWith('pending') ||
      invoice.status.startsWith('updated')
    ) {
      const modal = await this.masterSvc.modal().create({
        component: AddInvoiceComponent,
        componentProps: {
          value: invoice,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'addInvoice',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      const modal = await this.masterSvc.modal().create({
        component: ViewInvoiceComponent,
        componentProps: {
          invoice,
        },
        showBackdrop: false,
        id: 'viewInvoice',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    }
  }
  async viewPayment(payment: Payment) {
    const modal = await this.masterSvc.modal().create({
      component: AddPaymentComponent,
      componentProps: {
        payment,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'viewPayment',
      cssClass: 'accent',
    });
    return await modal.present();
  }
  async viewCredit(credit: Credit) {
    const modal = await this.masterSvc.modal().create({
      component: AddCreditComponent,
      componentProps: {
        value: credit,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'viewCredit',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
}
