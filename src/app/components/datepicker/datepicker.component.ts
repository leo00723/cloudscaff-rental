import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent implements OnInit {
  @Output() selectedDate = new EventEmitter<string>();
  constructor(private modalController: ModalController) {}

  ngOnInit() {}
  update(args: string) {
    this.modalController.dismiss(format(parseISO(args), 'MMM dd yyyy'));
  }
}
