import { Component, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MenuController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { environment } from 'src/environments/environment';
import { EditprofileComponent } from '../components/editprofile/editprofile.component';
import { Company } from '../models/company.model';
import { InventoryEstimate } from '../models/inventoryEstimate.model';
import { AppState } from '../shared/app/app.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {
  public appPages = [
    // {
    //   title: 'Dashboard',
    //   url: '/dashboard/view',
    //   icon: 'home',
    //   roles: 'Owner,Admin,Super-Admin',
    // },
    {
      title: 'Enquiries',
      url: '/dashboard/enquiries',
      icon: 'reader-outline',
      roles: 'Owner,Admin,Super-Admin',
    },
    {
      title: 'Estimates',
      url: '/dashboard/estimates',
      icon: 'options-outline',
      roles: 'Owner,Admin,Super-Admin',
    },
    {
      title: 'Sites',
      url: '/dashboard/sites',
      icon: 'business-outline',
      roles: 'Owner,Admin,Super-Admin,Supervisor',
    },
    {
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'bar-chart-outline',
      roles: 'Owner,Admin,Super-Admin,Supervisor',
    },
    {
      title: 'Statements',
      url: '/dashboard/statements',
      icon: 'document-text-outline',
      roles: 'Owner,Admin,Super-Admin',
    },
    {
      title: 'Notifications',
      url: '/dashboard/notifications',
      icon: 'notifications-outline',
      roles: 'Owner,Admin,Super-Admin',
    },
  ];
  loading = false;
  version = environment.version;
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  platform = this.masterSvc.platform();
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private menu: MenuController,
    private updates: SwUpdate
  ) {}

  daysbetween(startDateSeconds: number, endDateSeconds: number) {
    return Math.round((startDateSeconds - endDateSeconds) / 60 / 60 / 24);
  }
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
        this.updates
          .checkForUpdate()
          .then((res) => {
            if (res) {
              this.masterSvc.notification().presentAlertConfirm(
                () => {
                  this.updates
                    .activateUpdate()
                    .then(() => window.location.reload());
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

  switch(userId: string, company: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        await this.masterSvc.edit().updateDoc('users', userId, { company });
        window.location.reload();
      } catch (error) {
        console.error(error);
        this.masterSvc
          .notification()
          .toast('Something went wrong, please try again!', 'danger');
      }
    });
  }

  call() {
    window.open('https://calendly.com/cloudscaff/onboarding', '_blank');
  }
  chat() {
    window.open('https://tawk.to/cloudscaff', '_blank');
  }
}
