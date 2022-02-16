import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { AuthService } from './auth.service';
import { EditService } from './edit.service';
import { NotificationService } from './notification.service';
import { PdfService } from './pdf.service';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  constructor(
    private authSvc: AuthService,
    private editSvc: EditService,
    private notificationSvc: NotificationService,
    private routing: Router,
    private formBuilder: FormBuilder,
    private pdfService: PdfService,
    private fileOpenerService: FileOpener,
    private platformService: Platform,
    private modalController: ModalController
  ) {}
  auth() {
    return this.authSvc;
  }

  handlePdf(pdf: any, filename: string) {
    if (this.platformService.is('cordova')) {
      pdf.getBase64(async (data) => {
        try {
          let path = `${filename}.pdf`;
          const result = await Filesystem.writeFile({
            path,
            data,
            directory: Directory.Data,
          });
          this.fileOpenerService.open(`${result.uri}`, 'application/pdf');
        } catch (e) {
          console.error('Unable to write file', e);
        }
      });
    } else if (!this.platformService.is('iphone')) {
      pdf.download(filename);
    } else {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }

  edit() {
    return this.editSvc;
  }
  fb() {
    return this.formBuilder;
  }
  fileOpener() {
    return this.fileOpenerService;
  }
  modal() {
    return this.modalController;
  }
  notification() {
    return this.notificationSvc;
  }
  pdf() {
    return this.pdfService;
  }

  platform() {
    return this.platformService;
  }

  router() {
    return this.routing;
  }

  sites() {
    return null;
  }
}
