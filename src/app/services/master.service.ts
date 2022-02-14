import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
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
    private pdfService: PdfService
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
  notification() {
    return this.notificationSvc;
  }
  pdf() {
    return this.pdfService;
  }

  router() {
    return this.routing;
  }

  sites() {
    return null;
  }
}
