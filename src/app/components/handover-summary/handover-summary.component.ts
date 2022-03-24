import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Handover } from 'src/app/models/handover.model';

@Component({
  selector: 'app-handover-summary',
  templateUrl: './handover-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandoverSummaryComponent {
  @Input() handover: Handover;
  constructor(private modalSvc: ModalController) {}
  close() {
    this.modalSvc.dismiss(null, 'close', 'viewHandover');
  }
}
