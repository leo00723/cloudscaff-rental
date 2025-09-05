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
    // },
    {
      title: 'Enquiries',
      permission: 'Enquiries',
      url: '/dashboard/enquiries',
      icon: 'reader-outline',
    },
    // {
    //   title: 'Estimates',
    //   permission: 'Estimates',
    //   url: '/dashboard/estimates',
    //   icon: 'options-outline',
    // },
    {
      title: 'Invoices',
      permission: 'Invoices',
      url: '/dashboard/invoices',
      icon: 'receipt-outline',
    },
    // {
    //   title: 'Instructions',
    //   permission: 'Instructions',
    //   url: '/dashboard/site-instructions',
    //   icon: 'newspaper-outline',
    // },
    // {
    //   title: 'Handovers',
    //   permission: 'Handover List',
    //   url: '/dashboard/handovers',
    //   icon: 'document-text-outline',
    // },
    {
      title: 'Sites',
      url: '/dashboard/sites',
      icon: 'business-outline',
    },
    {
      title: 'Inventory',
      permission: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'bar-chart-outline',
    },
  ];
  loading = false;
  version = environment.version;
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  @Select() notificationFlag$: Observable<number>;
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
