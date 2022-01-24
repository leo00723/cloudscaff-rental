import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from './auth.service';
import { EditService } from './edit.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  constructor(
    private authSvc: AuthService,
    private editSvc: EditService,
    private notificationSvc: NotificationService,
    private routing: Router
  ) {}
  auth() {
    return this.authSvc;
  }
  edit() {
    return this.editSvc;
  }
  notification() {
    return this.notificationSvc;
  }

  router() {
    return this.routing;
  }

  sites() {
    return null;
  }
}
