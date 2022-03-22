import { Component, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MenuController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { environment } from 'src/environments/environment';
import { EditprofileComponent } from '../components/editprofile/editprofile.component';

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
  ];
  loading = false;
  version = environment.version;
  @Select() user$: Observable<User>;
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
            `${environment.version} available!`,
            'click Yes to install update'
          );
        } else {
          this.masterSvc.notification().toast('No updates available', 'dark');
        }
        this.loading = false;
      })
      .catch((err) => {
        setTimeout(() => {
          this.masterSvc.notification().toast('No updates available', 'dark');
          this.loading = false;
        }, 2000);
      });
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
