import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent {
  @ViewChild('date') date: IonDatetime;
  @Input() value: string | undefined;
  @Input() min: string | undefined;
  @Input() field: string;
  constructor(private modalController: ModalController) {}
  confirm() {
    this.date.confirm(false).then(() => {
      this.modalController.dismiss(
        format(parseISO(this.date.value), 'yyyy-MM-dd'),
        'button',
        this.field
      );
    });
  }
  cancel() {
    this.date.cancel(false).then(() => {
      this.modalController.dismiss(undefined, this.field);
    });
  }
}
