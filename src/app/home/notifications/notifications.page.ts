import { Component, OnInit, inject } from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications.page.html',
})
export class NotificationsPage implements OnInit {
  date = new Date();
  notifications = [
    {
      title: 'New Estimate',
      date: '2023-12-24',
      message:
        'A new estimate has been generated for Project Alpha. Check details and update if necessary.',
    },
    {
      title: 'Site Inspection',
      date: '2023-12-25',
      message:
        'Site inspection scheduled for tomorrow at 10 AM. Ensure all safety protocols are in place.',
    },
    {
      title: 'Scaffold Update',
      date: '2023-12-26',
      message:
        'Critical update: Scaffolding at Site Bravo needs inspection. Address issues promptly.',
    },
    {
      title: 'Low Stock Alert',
      date: '2023-12-27',
      message:
        'Running low on essential materials. Place an order to replenish inventory.',
    },
    {
      title: 'Estimate Approval Reminder',
      date: '2023-12-28',
      message:
        'Reminder: Approve the latest estimate for Project Gamma by end of the day.',
    },
    {
      title: 'Emergency Site Closure',
      date: '2023-12-29',
      message:
        'Emergency site closure due to unforeseen circumstances. Notify all team members and reschedule tasks.',
    },
    {
      title: 'Scaffold Inspection Update',
      date: '2023-12-30',
      message:
        'Inspection completed successfully. Scaffolding at Site Delta is secure for use.',
    },
    {
      title: 'Inventory Update',
      date: '2023-12-31',
      message:
        'New supplies received. Update the system to reflect the current stock levels.',
    },
  ];
  masterService = inject(MasterService);

  constructor() {}

  ngOnInit() {}

  delete(index) {
    this.masterService.notification().presentAlertConfirm(() => {
      this.notifications.splice(index, 1);
    });
  }

  archive(index) {
    this.masterService.notification().presentAlertConfirm(() => {
      this.notifications.splice(index, 1);
    });
  }
}
