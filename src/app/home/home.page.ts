import { Component, NgZone, OnDestroy } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MenuController } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { AuthService } from '../services/auth.service';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {
  public appPages = [
    // { title: 'Dashboard', url: '/home/dashboard', icon: 'home' },
    { title: 'Estimates', url: '/home/estimates', icon: 'options-outline' },
    { title: 'Sites', url: '/home/sites', icon: 'business-outline' },
  ];
  loading = false;
  user$: Observable<any>;
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private menu: MenuController,
    private updates: SwUpdate
  ) {
    this.user$ = this.masterSvc.auth().user$;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  check() {
    this.loading = true;
    if (this.masterSvc.platform().is('cordova')) {
      this.masterSvc.notification().toast('No updates availiable', 'dark');
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
                  document.location.reload();
                }
              });
            },
            'New update availiable!',
            'click Yes to install update'
          );
        } else {
          this.masterSvc.notification().toast('No updates availiable', 'dark');
        }
        this.loading = false;
      })
      .catch((err) => {
        setTimeout(() => {
          this.masterSvc.notification().toast('No updates availiable', 'dark');
          this.loading = false;
        }, 2000);
      });
  }

  async logout() {
    await this.menu.close();
    this.masterSvc
      .auth()
      .logout()
      .then(() =>
        this.masterSvc.router().navigateByUrl('/login', { replaceUrl: true })
      );
  }
}
