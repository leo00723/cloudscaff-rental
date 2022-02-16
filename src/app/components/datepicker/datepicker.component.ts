import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { format, parseISO, getISODay, getDate } from 'date-fns';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent {
  @ViewChild('date') date: IonDatetime;
  @Input() value: string;
  @Input() field: string;
  constructor(private modalController: ModalController) {}
  confirm() {
    this.date.confirm(false).then(() => {
      this.modalController.dismiss(this.date.value, 'button', this.field);
    });
  }
  cancel() {
    this.date.cancel(false).then(() => {
      this.modalController.dismiss(this.date.value, 'button', this.field);
    });
  }
}
