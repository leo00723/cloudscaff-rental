import { Injectable } from '@angular/core';
import { AlertController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async toast(header: string, color: string, duration?: number) {
    const toast = await this.toastController.create({
      header,
      icon: 'notifications-outline',
      mode: 'ios',
      color,
      position: 'bottom',
      duration: duration ? duration : 1000,
    });
    return await toast.present();
  }

  async presentAlertConfirm(callback?, header?: string, message?: string) {
    const alert = await this.alertController.create({
      header: header ? header : 'Are you sure you want to continue?',
      mode: 'ios',
      message: message ? message : 'click Yes to proceed',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          id: 'cancel-button',
        },
        {
          text: 'Yes',
          id: 'confirm-button',
          handler: () => {
            callback();
          },
        },
      ],
    });

    await alert.present();
  }
}
