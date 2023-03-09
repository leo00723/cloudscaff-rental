import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { CalculationService } from './calculation.service';
import { EditService } from './edit.service';
import { ImgService } from './img.service';
import { NotificationService } from './notification.service';
import { PdfService } from './pdf.service';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  constructor(
    private authSvc: AuthService,
    private calcSvc: CalculationService,
    private editSvc: EditService,
    private notificationSvc: NotificationService,
    private routing: Router,
    private formBuilder: FormBuilder,
    private pdfService: PdfService,
    private platformService: Platform,
    private modalController: ModalController,
    private storeSvc: Store,
    private imgSvc: ImgService
  ) {}
  auth() {
    return this.authSvc;
  }

  calc() {
    return this.calcSvc;
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
  img() {
    return this.imgSvc;
  }
}
