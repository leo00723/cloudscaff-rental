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
  selector: 'app-view-stock-log',
  templateUrl: './view-stock-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStockLogComponent {
  @Input() log$: Observable<any>;
  constructor(private modalSvc: ModalController, private router: Router) {}

  close() {
    this.modalSvc.dismiss();
  }
}
