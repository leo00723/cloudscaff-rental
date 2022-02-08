import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MasterService } from './services/master.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private updates: SwUpdate, private masterSvc: MasterService) {}

  ngOnInit(): void {
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
          'New Update Availiable',
          'click Yes to install update'
        );
      }
    });
  }
}
