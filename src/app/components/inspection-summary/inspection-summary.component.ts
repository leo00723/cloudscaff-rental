import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Inspection } from 'src/app/models/inspection.model';

@Component({
  selector: 'app-inspection-summary',
  templateUrl: './inspection-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionSummaryComponent {
  @Input() inspection: Inspection;
  constructor(private modalSvc: ModalController) {}
  close() {
    this.modalSvc.dismiss(null, 'close', 'viewInspection');
  }
}
