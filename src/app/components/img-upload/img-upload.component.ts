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
    'ion-img::part(image){border-radius:10px; width:300px; height:100px}',
  ],
})
export class ImgUploadComponent {
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
    const image = await Camera.pickImages({
      quality: 75,
      width: 300,
      height: 100,
      limit: 1,
    });
    if (image) {
      this.loading = true;
      const res = await this.imgSvc.uploadBlob(
        image.photos[0],
        `${this.path}.${image.photos[0].format}`,
        this.deleteRef
      );
      if (res) {
        this.url = res.url;
        this.result.emit(res);
      } else {
        this.notificationSvc.toast(
          'Something went wrong selecting your image. Please try again!',
          'danger'
        );
      }
      this.loading = false;
    }
  }
}
