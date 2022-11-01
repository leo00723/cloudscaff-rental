import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() title = '';
  @Input() showMenu = true;
  @Input() showBack = false;
  @Input() path = '';
  @Input() btnName = '';
  @Input() iconColor = '';
  @Output() updated = new EventEmitter<boolean>();

  constructor(private masterSvc: MasterService) {}

  async update() {
    if (this.btnName === 'notifications') {
      const modal = await this.masterSvc.modal().create({
        component: NotificationsComponent,
        cssClass: 'fullscreen',
        showBackdrop: false,
        id: 'notifications',
      });
      return await modal.present();
    } else {
      this.updated.emit(true);
    }
  }
}
