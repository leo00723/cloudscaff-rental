import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  page = 0;
  categories = [
    {
      name: 'Enquiry / Lead Management',
      challenges: [
        {
          problem: 'Keeping track of clients',
          solution: 'Cloudscaff Enquiries',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'loss of money',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Estimate / Quote Management',
      challenges: [
        {
          problem: 'Late Estimates',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'loss of money',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Site / Job Management',
      challenges: [
        {
          problem: 'Late Estimates',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'loss of money',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Inventory / Stock Management',
      challenges: [
        {
          problem: 'Lost Inventory',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Missed Shipments',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'loss of money',
          benefit: '',
          selected: false,
        },
      ],
    },
  ];
  selected: any = {
    name: 'Inventory / Stock Management',
    challenges: [
      {
        problem: 'Lost Inventory',
        solution: 'Cloudscaff Estimates',
        selected: true,
      },
      {
        problem: 'Missed Shipments',
        solution: 'Cloudscaff Estimates',
        selected: true,
      },
    ],
    impacts: [
      {
        effect: 'loss of money',
        benefit:
          'Cloudscaff tracks and manages all inventory accross all sites',
        selected: true,
      },
    ],
  };
  isLoading = false;
  private masterSvc: MasterService = inject(MasterService);
  constructor(private router: Router) {}

  ngOnInit() {}

  next({ user, company }, settings: boolean) {
    console.log('emmited');
    if (!user?.needsSetup && !company?.needsSetup) {
      if (settings) {
        this.router.navigateByUrl('/dashboard/settings');
      } else {
        this.router.navigateByUrl('/dashboard/sites');
      }
    }
  }

  selectCategory(category: any) {
    this.selected = category;
    this.page = 2;
  }

  async complete() {
    try {
      this.isLoading = true;
      const id = this.masterSvc.store().selectSnapshot(CompanyState.company).id;
      console.log(id);
      await this.masterSvc
        .edit()
        .updateDoc('company', id, { optimize: this.selected });
      this.page = 5;
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
}
