import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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
    { title: 'Estimates', url: '/home/estimates', icon: 'options' },
  ];
  private subs = new Subscription();
  constructor(
    public authSvc: AuthService,
    private masterSvc: MasterService,
    private router: Router,
    private menu: MenuController
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

  async logout() {
    await this.menu.close();
    this.authSvc.logout().then(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
