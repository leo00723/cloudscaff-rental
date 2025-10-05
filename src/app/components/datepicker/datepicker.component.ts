import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { format, parseISO, parse } from 'date-fns';

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

  get isoValue(): string | undefined {
    if (!this.value) return undefined;
    try {
      const parsedDate = parse(this.value, 'dd-MM-yyyy', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    } catch {
      return undefined;
    }
  }

  confirm() {
    this.date.confirm(false).then(() => {
      this.modalController.dismiss(
        format(parseISO(this.date.value.toString()), 'dd-MM-yyyy'),
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
