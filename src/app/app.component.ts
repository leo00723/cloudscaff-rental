import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { MasterService } from './services/master.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  constructor(private updates: SwUpdate, private masterSvc: MasterService) {
    this.subs.add(this.masterSvc.auth().init());
  }

  ngOnInit(): void {
    if (!this.masterSvc.platform().is('mobile')) {
      this.subs.add(
        this.updates.versionUpdates.subscribe((event) => {
          if (event.type === 'VERSION_READY') {
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
          }
        })
      );
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
