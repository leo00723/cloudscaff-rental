import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
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
  @Input() showSave = true;
  @Output() res = new EventEmitter<{ signature: string; name: string }>();
  signature: string;
  name: string;
  signaturePadOptions: any = {
    minWidth: 0.1,
    canvasWidth: this.device.width() < 500 ? this.device.width() - 32 : 400,
    canvasHeight: 200,
  };

  constructor(private device: Platform) {}

  clearSignature() {
    this.signaturePad.clear();
    this.res.emit({ signature: null, name: this.name });
  }

  savePad() {
    const base64Data = this.signaturePad.toDataURL();
    this.res.emit({ signature: base64Data, name: this.name });
  }
}
