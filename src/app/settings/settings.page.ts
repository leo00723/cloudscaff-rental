import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  settings = [
    {
      title: 'Business Settings',
      description: 'Here you can manage your business profile.',
      path: '/dashboard/settings/company',
    },
    {
      title: 'Customer Profiles',
      description: 'Here you can manage your customer profiles.',
      path: '/dashboard/settings/customers',
    },
    {
      title: 'Rate Profiles',
      description: 'Here you can manage your rate profiles.',
      path: '/dashboard/settings/rates',
    },
    {
      title: 'Labor Profiles',
      description: 'Here you can manage your labor profiles.',
      path: '/dashboard/settings/labor',
    },
    {
      title: 'Terms & Conditions',
      description: "Here you add T's & C's for your documents.",
      path: '/dashboard/settings/terms',
    },
  ];
}
