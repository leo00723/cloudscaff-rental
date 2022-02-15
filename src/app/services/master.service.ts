import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
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
    private platformService: Platform
  ) {}
  auth() {
    return this.authSvc;
  }

  handlePdf(
    pdf: any,
    type: 'print' | 'preview' | 'download',
    filename: string
  ) {
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
    } else {
      switch (type) {
        case 'print':
          pdf.print();
          break;
        case 'preview':
          pdf.open();
          break;
        case 'download':
          pdf.download(filename);
          break;
      }
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
