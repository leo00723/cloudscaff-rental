import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-signature-modal',
  templateUrl: './signature-modal.component.html',
  styleUrls: ['./signature-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SignatureModalComponent implements OnInit {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  signature: string;
  name: string;
  signaturePadOptions: any = {
    minWidth: 0.1,
    canvasWidth: this.device.width() < 500 ? this.device.width() - 32 : 400,
    canvasHeight: 200,
  };
  private modalSvc = inject(ModalController);
  constructor(private device: Platform) {}

  ngOnInit(): void {}

  cancel() {
    this.modalSvc.dismiss(undefined, 'cancel', 'sign');
  }
  confirm() {
    const base64Data = this.signaturePad.toDataURL();
    this.modalSvc.dismiss(
      { signature: base64Data, name: this.name },
      'confirm',
      'sign'
    );
  }
  clear() {
    this.signaturePad.clear();
  }
}
