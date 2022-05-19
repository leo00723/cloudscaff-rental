import { Component, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MenuController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { environment } from 'src/environments/environment';
import { EditprofileComponent } from '../components/editprofile/editprofile.component';
import { AppState } from '../shared/app/app.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {
  public appPages = [
    // { title: 'Dashboard', url: '/dashboard/dashboard', icon: 'home' },
    {
      title: 'Estimates',
      url: '/dashboard/estimates',
      icon: 'options-outline',
    },
    { title: 'Sites', url: '/dashboard/sites', icon: 'business-outline' },
    {
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'bar-chart-outline',
    },
    {
      title: 'Statements',
      url: '/dashboard/statements',
      icon: 'document-text-outline',
    },
  ];
  loading = false;
  version = environment.version;
  @Select() user$: Observable<User>;
  isIphone = this.masterSvc.platform().is('iphone');
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private menu: MenuController,
    private updates: SwUpdate
  ) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  check() {
    this.loading = true;
    if (this.masterSvc.platform().is('cordova')) {
      this.masterSvc.notification().toast('No updates available', 'dark');
      this.loading = false;
      return;
    }
    const version = this.masterSvc.store().selectSnapshot(AppState.version);
    if (version) {
      if (!this.masterSvc.platform().is('cordova')) {
        const version = this.masterSvc.store().selectSnapshot(AppState.version);
        this.updates
          .checkForUpdate()
          .then((res) => {
            if (res) {
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
            } else {
              this.masterSvc
                .notification()
                .toast('No updates available', 'dark');
            }
            this.loading = false;
          })
          .catch((err) => {
            setTimeout(() => {
              this.masterSvc
                .notification()
                .toast('No updates available', 'dark');
              this.loading = false;
            }, 2000);
          });
      }
    }
  }

  async editProfile() {
    const modal = await this.masterSvc.modal().create({
      component: EditprofileComponent,
      id: 'editProfile',
    });
    return await modal.present();
  }

  async logout() {
    await this.menu.close();
    this.masterSvc.auth().logout();
  }
}
