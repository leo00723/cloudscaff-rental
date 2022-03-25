import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Handover } from 'src/app/models/handover.model';
import { EditService } from 'src/app/services/edit.service';
import { ImgService } from 'src/app/services/img.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-handover-summary',
  templateUrl: './handover-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      ion-img::part(image) {
        width: 300px !important;
        height: 200px !important;
      }
    `,
  ],
})
export class HandoverSummaryComponent {
  @Input() handover: Handover;
  isLoading = false;
  constructor(
    private modalSvc: ModalController,
    private notificationSvc: NotificationService,
    private imgService: ImgService,
    private editService: EditService,
    private change: ChangeDetectorRef
  ) {}
  close() {
    this.modalSvc.dismiss(null, 'close', 'viewHandover');
  }

  async sign(ev) {
    this.isLoading = true;
    try {
      const blob = await (await fetch(ev)).blob();
      const res = await this.imgService.uploadBlob(
        blob,
        `company/${this.handover.company.id}/handovers/${this.handover.id}/signature`,
        ''
      );
      if (res) {
        this.handover.signature = res.url2;
        this.handover.signatureRef = res.ref;
        this.editService.setDoc(
          `company/${this.handover.company.id}/handovers`,
          this.handover,
          this.handover.id
        );
        this.notificationSvc.toast('Document signed successfully!', 'success');
        this.isLoading = false;
        this.change.detectChanges();
      } else {
        throw Error;
      }
    } catch (e) {
      console.error(e);
      this.notificationSvc.toast(
        'Something went wrong signing your document. Please try again!',
        'danger'
      );
      this.isLoading = false;
    }
  }
}
