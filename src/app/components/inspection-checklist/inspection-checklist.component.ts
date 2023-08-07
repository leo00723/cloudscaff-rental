import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { HandoverTemplate } from 'src/app/models/handoverTemplate.model';
import { InspectionTemplate } from 'src/app/models/invoiceTemplate.model';

@Component({
  selector: 'app-inspection-checklist',
  templateUrl: './inspection-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionChecklistComponent {
  @Input() questions: InspectionTemplate | HandoverTemplate;
  @Output() list = new EventEmitter<any>();

  change(ev, item) {
    item.value = ev.detail.value;
    this.list.emit(this.questions);
  }
}
