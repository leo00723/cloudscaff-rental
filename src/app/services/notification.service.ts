import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastController: ToastController) {}

  async successToast(header: string, duration?: number) {
    const toast = await this.toastController.create({
      header,
      icon: 'notifications-outline',
      mode: 'ios',
      color: 'success',
      position: 'bottom',
      duration: duration ? duration : 1000,
    });
    return await toast.present();
  }

  async errorToast(header: string, duration?: number) {
    const toast = await this.toastController.create({
      header,
      icon: 'notifications-outline',
      mode: 'ios',
      color: 'danger',
      position: 'bottom',
      duration: duration ? duration : 1000,
    });
    return await toast.present();
  }
}
