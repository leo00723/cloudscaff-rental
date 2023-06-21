/* eslint-disable max-len */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  GalleryPhotos,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngxs/store';
import { ImgService } from 'src/app/services/img.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styles: [],
})
export class UploaderComponent implements OnInit {
  @Output() res = new EventEmitter<{ url: string; ref: string }[]>();
  selectedImages: GalleryPhotos;
  uploaded: { url: string; ref: string }[] = [];
  loading = false;
  constructor(private imgSvc: ImgService, private store: Store) {}

  ngOnInit(): void {}

  async pickImages() {
    try {
      if (Capacitor.getPlatform() !== 'web') {
        await Camera.requestPermissions();
      }
      this.selectedImages = await Camera.pickImages({});
    } catch (error) {
      console.error(error);
    }
  }

  async upload() {
    try {
      this.uploaded = [];
      for await (const image of this.selectedImages.photos) {
        this.loading = true;
        const blob = await (await fetch(image.webPath)).blob();
        const company = this.store.selectSnapshot(CompanyState.company);
        const res = await this.imgSvc.uploadBlobNoResize(
          blob,
          `company/${company.id}/uploads/${Date.now()}.${image.format}`
        );
        if (res) {
          this.uploaded.push(res);
        }
      }
      this.selectedImages = null;
      this.res.emit(this.uploaded);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async delete(ref: string, index: number) {
    try {
      await this.imgSvc.deleteFile(ref);
      this.uploaded.splice(index, 1);
      this.res.emit(this.uploaded);
    } catch (error) {
      console.error(error);
    }
  }

  remove(index: number) {
    this.selectedImages.photos.splice(index, 1);
  }
}
