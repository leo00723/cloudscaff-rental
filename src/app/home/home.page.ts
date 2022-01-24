import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {
  public appPages = [
    { title: 'Dashboard', url: '/home/dashboard', icon: 'home' },
    { title: 'Estimates', url: '/home/estimates', icon: 'options' },
  ];
  user$: any;
  user: any;
  constructor(
    public authSvc: AuthService,
    private router: Router,
    private menu: MenuController
  ) {
    this.user$ = this.authSvc.user$.subscribe((user) => {
      this.user = user;
    });
  }
  ngOnDestroy(): void {
    this.user$.unsubscribe();
  }

  async logout() {
    await this.menu.close();
    this.authSvc.logout().then(() => {
      localStorage.clear();
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
