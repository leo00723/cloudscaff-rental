import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Platform } from '@ionic/angular';
import { SignaturePad } from 'angular2-signaturepad';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SignaturePadComponent {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @Output() result = new EventEmitter<string>();
  signature: string;
  signaturePadOptions: Object = {
    minWidth: 0.1,
    canvasWidth: this.device.width() < 500 ? this.device.width() - 32 : 400,
    canvasHeight: 200,
  };

  constructor(
    private device: Platform,
    private notificationSvc: NotificationService
  ) {}

  clearSignature() {
    this.signaturePad.clear();
  }

  savePad() {
    this.notificationSvc.presentAlertConfirm(() => {
      const base64Data = this.signaturePad.toDataURL();
      this.result.emit(base64Data);
    });
  }
}
