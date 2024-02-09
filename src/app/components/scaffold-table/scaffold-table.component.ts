import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-scaffold-table',
  templateUrl: './scaffold-table.component.html',
  styles: [
    `
      tr {
        font-size: 0.8rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Scaffold>();
  @Input() set value(estimates: Observable<Scaffold[]>) {
    this.temp$ = estimates;
    this.scaffolds$ = estimates;
  }
  @Input() showScaffoldList = true;
  @Input() showRegister = false;
  @Select() company$: Observable<Company>;
  scaffolds$: Observable<Scaffold[]>;
  temp$: Observable<Scaffold[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  private modalController: ModalController = inject(ModalController);
  private masterSvc = inject(MasterService);
  private loadingCtrl = inject(LoadingController);

  filterScaffold(scaffold: Scaffold) {
    return scaffold.latestHandover ? true : false;
  }

  constructor() {
    this.temp$ = this.scaffolds$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status.split('-')[0]) {
      case 'active':
        return 'success';
      case 'pending':
        return 'primary';
      case 'inactive':
        return 'danger';
      case 'Dismantled':
        return 'danger';
    }
  }

  async viewHandover(handover: Handover) {
    const modal = await this.modalController.create({
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

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.scaffolds$.pipe(
      map((data) =>
        data.filter(
          (s) =>
            s.code.toLowerCase().indexOf(val) !== -1 ||
            s.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    if (this.showScaffoldList) {
      this.table.offset = 0;
    }
  }
  downloadHandover(handover: Handover) {
    this.masterSvc
      .edit()
      .getDocById(`company/${handover.company.id}/terms`, 'Handover')
      .subscribe(async (terms) => {
        const loading = await this.loadingCtrl.create({
          message: 'Downloading document',
          mode: 'ios',
        });
        loading.present();
        handover = { ...handover, date: handover?.date?.toDate() };
        const pdf = await this.masterSvc
          .pdf()
          .generateHandover(handover, handover.company, terms || null);
        this.masterSvc.pdf().handlePdf(pdf, handover.code);
        loading.dismiss();
      });
  }
  async downloadInspection(inspection: Inspection) {
    this.masterSvc
      .edit()
      .getDocById(`company/${inspection.company.id}/terms`, 'Inspection')
      .subscribe(async (terms) => {
        const loading = await this.loadingCtrl.create({
          message: 'Downloading document',
          mode: 'ios',
        });
        loading.present();
        inspection = { ...inspection, date: inspection?.date?.toDate() };
        const pdf = await this.masterSvc
          .pdf()
          .generateInspection(inspection, inspection.company, terms || null);
        this.masterSvc.pdf().handlePdf(pdf, inspection.code);
        loading.dismiss();
      });
  }
}
