import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private toastController: ToastController,
    public alertController: AlertController
  ) {}

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

  async presentAlertConfirm(callback?) {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to continue?',
      message: 'click Yes to proceed',
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
