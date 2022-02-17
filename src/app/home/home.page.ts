import { Component, OnDestroy } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MenuController } from '@ionic/angular';
import { of, Subscription } from 'rxjs';
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
  private subs = new Subscription();
  constructor(
    public authSvc: AuthService,
    private masterSvc: MasterService,
    private router: Router,
    private menu: MenuController,
    private updates: SwUpdate
  ) {
    this.subs.add(
      this.masterSvc
        .auth()
        .user$.pipe(
          switchMap((user) => {
            if (user) {
              return this.masterSvc.auth().getCompany(user.company);
            } else {
              return of(false);
            }
          })
        )
        .subscribe((company: Company) => {
          this.authSvc.company$.next(company);
        })
    );
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  check() {
    this.loading = true;
    if (this.masterSvc.platform().is('mobile')) {
      this.masterSvc.notification().toast('No updates availiable', 'danger');
      this.loading = false;
    }
    this.updates.checkForUpdate().then((res) => {
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
    });
  }

  async logout() {
    await this.menu.close();
    this.authSvc.logout().then(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
