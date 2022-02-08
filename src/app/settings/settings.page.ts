import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
})
export class SettingsPage implements OnInit {
  settings = [
    {
      title: 'Business Settings',
      description: 'Here you can manage your business profile.',
      path: '/home/settings/company',
    },
    {
      title: 'Customer Profiles',
      description: 'Here you can manage your customer profiles.',
      path: '/home/settings/customers',
    },
    {
      title: 'Rate Profiles',
      description: 'Here you can manage your rate profiles.',
      path: '/home/settings/rates',
    },
    {
      title: 'Labor Profiles',
      description: 'Here you can manage your labor profiles.',
      path: '/home/settings/labor',
    },
  ];
  constructor() {}

  ngOnInit() {}
}
