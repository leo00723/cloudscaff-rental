import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  @Select() company$: Observable<Company>;
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
      title: 'Templates',
      description: 'Here you edit Templates for your documents.',
      path: '/dashboard/settings/templates',
    },
    {
      title: 'Terms & Conditions',
      // eslint-disable-next-line @typescript-eslint/quotes
      description: "Here you add T's & C's for your documents.",
      path: '/dashboard/settings/terms',
    },

    {
      title: 'User Profiles',
      description: 'Here you manage users.',
      path: '/dashboard/settings/users',
    },
  ];
}
