import { Component, OnDestroy, OnInit } from '@angular/core';
import { traceUntilFirst } from '@angular/fire/performance';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnDestroy, OnInit {
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {}
  ngOnInit(): void {
    this.subs.add(
      this.masterSvc.auth().user$.subscribe((user) => {
        if (user) {
          this.masterSvc.router().navigateByUrl('/home', { replaceUrl: true });
        } else {
          this.masterSvc.router().navigate(['/login'], { replaceUrl: true });
        }
      })
    );
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
