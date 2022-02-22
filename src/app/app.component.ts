import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { MasterService } from './services/master.service';
import { SplashPage } from './splash/splash.page';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  constructor(
    private updates: SwUpdate,
    private masterSvc: MasterService,
    private ngZone: NgZone
  ) {
    this.splash().then(async (modal) => {
      this.subs.add(
        this.masterSvc.auth().user$.subscribe(async (user) => {
          if (user) {
            this.ngZone.run(() => {
              this.masterSvc
                .router()
                .navigateByUrl('/home', { replaceUrl: true })
                .then(async () => {
                  await modal.dismiss().then(() => {});
                });
            });
          } else {
            this.ngZone.run(() => {
              this.masterSvc
                .router()
                .navigateByUrl('/login', { replaceUrl: true })
                .then(async () => {
                  await modal.dismiss().then(() => {});
                });
            });
          }
        })
      );
    });
  }

  async splash() {
    const modal = await this.masterSvc.modal().create({
      component: SplashPage,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'splash',
    });
    await modal.present();
    return modal;
  }

  ngOnInit(): void {
    if (!this.masterSvc.platform().is('mobile')) {
      this.subs.add(
        this.updates.versionUpdates.subscribe((event) => {
          if (event.type === 'VERSION_READY') {
            this.masterSvc.notification().presentAlertConfirm(
              () => {
                this.updates.activateUpdate().then((res) => {
                  if (res) {
                    document.location.reload();
                  }
                });
              },
              'New update availiable!',
              'click Yes to install update'
            );
          }
        })
      );
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
