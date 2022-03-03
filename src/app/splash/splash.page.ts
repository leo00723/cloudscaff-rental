import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  template: `
    <ion-content>
      <div class="bg-primary vh-100 d-flex align-items-center">
        <div class="m-auto">
          <img
            class="p-5 fade-in"
            width="300px"
            src="assets/icons/icon-512x512.png"
          />
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {
  constructor(private modalSvc: ModalController) {
    setTimeout(() => {
      this.modalSvc.dismiss(null, 'close', 'splash');
    }, 1500);
  }
}
