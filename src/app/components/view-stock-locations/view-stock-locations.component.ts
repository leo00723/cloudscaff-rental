import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, take } from 'rxjs';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Company } from 'src/app/models/company.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-view-stock-locations',
  templateUrl: './view-stock-locations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStockLocationsComponent {
  @Input() locations$: Observable<{ site: any; item: InventoryItem }[]>;
  @Input() item: InventoryItem;

  private masterSvc = inject(MasterService);
  company: Company;

  constructor(private modalSvc: ModalController, private router: Router) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  close() {
    this.modalSvc.dismiss();
  }

  viewSite(location) {
    this.close();
    this.router.navigateByUrl(
      `/dashboard/site/${location.site.companyId}-${location.site.id}`
    );
  }

  async downloadPdf() {
    this.locations$
      .pipe(take(1))
      .subscribe(async (locations: { site: any; item: InventoryItem }[]) => {
        if (locations && locations.length > 0) {
          const pdf = await this.masterSvc
            .pdf()
            .stockLocations(this.item, locations, this.company);
          this.masterSvc
            .pdf()
            .handlePdf(pdf, `Stock-Locations-${this.item.code}`);
        }
      });
  }
}
