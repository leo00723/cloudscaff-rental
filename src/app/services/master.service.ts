import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { EditService } from './edit.service';
import { NotificationService } from './notification.service';
import { PdfService } from './pdf.service';

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
    private platformService: Platform,
    private modalController: ModalController,
    private storeSvc: Store
  ) {}
  auth() {
    return this.authSvc;
  }

  edit() {
    return this.editSvc;
  }
  fb() {
    return this.formBuilder;
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

  store() {
    return this.storeSvc;
  }
  log(...message: any[]) {
    if (!environment.production) {
      console.log(message.toString());
    }
  }
}
