import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view-terms',
  templateUrl: './view-terms.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewTermsComponent {
  @Input() terms = '';
  constructor(private modalSvc: ModalController) {}

  close() {
    this.modalSvc.dismiss(undefined, 'close', 'viewTerms');
  }
}
