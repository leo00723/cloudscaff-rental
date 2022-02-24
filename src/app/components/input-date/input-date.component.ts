import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { DatepickerComponent } from '../datepicker/datepicker.component';

@Component({
  selector: 'app-input-date',
  templateUrl: './input-date.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDateComponent {
  @Input() title: string;
  @Input() form;
  @Input() controlName: string;
  @Input() min: string | undefined;
  constructor(private masterSvc: MasterService) {}

  async setDate(field: string) {
    const modal = await this.masterSvc.modal().create({
      component: DatepickerComponent,
      id: field,
      cssClass: 'date',
      componentProps: {
        value: this.form.get(this.controlName).value
          ? this.form.get(this.controlName).value
          : undefined,
        min: this.min,
        field,
      },
      backdropDismiss: false,
      mode: 'ios',
    });
    await modal.present();
    const date = (await modal.onDidDismiss()).data;

    date
      ? this.form.get(this.controlName).setValue(date)
      : this.form.get(this.controlName).value;
  }
}
