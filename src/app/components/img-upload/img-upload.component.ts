import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImgService } from 'src/app/services/img.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-img-upload',
  templateUrl: './img-upload.component.html',
  styles: [
    'img{border-radius:10px; height:100px}',
    'ion-icon{font-size:128px !important}',
  ],
})
export class ImgUploadComponent {
  @Input() icon = 'person-circle-outline';
  @Input() path: string;
  @Input() deleteRef: string;
  @Input() set image(val: string) {
    if (val) this.url = val;
  }
  @Output() result = new EventEmitter<any>();
  url = '';
  loading = false;
  constructor(
    private imgSvc: ImgService,
    private notificationSvc: NotificationService
  ) {}

  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      height: 100,
      source: CameraSource.Photos,
      resultType: CameraResultType.Uri,
    });

    if (image) {
      const blob = await (await fetch(image.webPath)).blob();
      const type = blob.type.toLowerCase();
      if (
        type.includes('webp') ||
        type.includes('png') ||
        type.includes('jpeg') ||
        type.includes('tiff') ||
        type.includes('jpg')
      ) {
        this.loading = true;
        const res = await this.imgSvc.uploadBlob(
          blob,
          this.path,
          this.deleteRef
        );
        if (res) {
          this.url = res.url1;
          this.result.emit(res);
        } else {
          this.notificationSvc.toast(
            'Something went wrong selecting your image. Please try again!',
            'danger'
          );
        }
        this.loading = false;
      } else {
        this.notificationSvc.toast(
          'Unsupported Format! Only jpeg, jpg, png, webp, tiff is allowed',
          'danger'
        );
      }
    }
  }
  async removeImage() {
    try {
      this.loading = true;
      await this.imgSvc.deletePhoto(`${this.deleteRef}_100x100.webp`);
      await this.imgSvc.deletePhoto(`${this.deleteRef}_300x100.webp`);
      this.url = '';
      this.deleteRef = '';
      this.result.emit({ url1: '', url2: '', ref: '' });
      this.loading = false;
    } catch (e) {
      console.error(e);
    }
  }
}
