import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { SplashPage } from './splash/splash.page';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  @Select() user$: Observable<User>;
  private subs = new Subscription();
  constructor(
    private updates: SwUpdate,
    private masterSvc: MasterService,
    private ngZone: NgZone
  ) {
    this.splash().then(async (modal) => {
      setTimeout(async () => {
        await modal.dismiss().then(() => {});
      }, 2000);
      // this.subs.add(
      //   this.user$.subscribe(async (user) => {
      //     const path = user ? '/login' : '/home';
      //     this.ngZone.run(async () => {
      //       await this.masterSvc
      //         .router()
      //         .navigateByUrl(path, { replaceUrl: true })
      //         .then(() => {
      //           setTimeout(async () => {
      //             await modal.dismiss().then(() => {});
      //           }, 1000);
      //         });
      //     });
      //   })
      // );
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
