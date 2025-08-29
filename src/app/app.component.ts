import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { GetVersion } from './shared/app/app.actions';
import { AppState } from './shared/app/app.state';
import { SplashPage } from './splash/splash.page';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  @Select() user$: Observable<User>;
  private subs = new Subscription();
  constructor(private updates: SwUpdate, private masterSvc: MasterService) {
    if (environment.production) {
      this.splash();
    }
    this.masterSvc.store().dispatch(new GetVersion('global'));
  }

  async splash() {
    const modal = await this.masterSvc.modal().create({
      component: SplashPage,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'splash',
    });
    return await modal.present();
  }

  ngOnInit(): void {
    this.init();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  init() {
    const version = this.masterSvc.store().selectSnapshot(AppState.version);
    if (version) {
      if (
        this.masterSvc.platform().is('mobileweb') ||
        this.masterSvc.platform().is('desktop') ||
        this.masterSvc.platform().is('pwa')
      ) {
        this.subs.add(
          this.updates.versionUpdates.subscribe((event) => {
            if (event.type === 'VERSION_READY') {
              this.masterSvc.notification().presentAlertConfirm(
                () => {
                  this.updates.activateUpdate().then((res) => {
                    if (res) {
                      window.location.reload();
                    }
                  });
                },
                `${version.version} available!`,
                `${version.message.toString().replace(',', '</br>')}`,
                'Click Yes to update'
              );
            }
          })
        );
      }
    } else {
      setTimeout(() => {
        this.init();
      }, 200);
    }
  }
}
