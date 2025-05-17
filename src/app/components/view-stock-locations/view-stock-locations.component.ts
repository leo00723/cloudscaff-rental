import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Component({
  selector: 'app-view-stock-locations',
  templateUrl: './view-stock-locations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStockLocationsComponent {
  @Input() locations$: Observable<{ site: any; item: InventoryItem }[]>;
  @Input() item: InventoryItem;
  constructor(private modalSvc: ModalController, private router: Router) {}

  close() {
    this.modalSvc.dismiss();
  }

  viewSite(location) {
    this.close();
    this.router.navigateByUrl(
      `/dashboard/site/${location.site.companyId}-${location.site.id}`
    );
  }
}
