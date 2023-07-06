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
          problem: 'Capture and Tracking',
          solution: 'Cloudscaff Enquiries',
          selected: false,
        },
        {
          problem: 'Qualification and Scoring',
          solution: 'Cloudscaff Enquiries',
          selected: false,
        },
        {
          problem: 'Follow-Up and Nurturing',
          solution: 'Cloudscaff Enquiries',
          selected: false,
        },
        {
          problem: 'Analytics and Reporting',
          solution: 'Cloudscaff Enquiries',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Decreased Conversion Rates',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Inconsistent Customer Experience',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Loss of Revenue and Wasted Resources',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Inaccurate Data and Reporting',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Estimate / Quote Management',
      challenges: [
        {
          problem: 'Incomplete or Inaccurate Information',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Changing Project Requirements',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Complex Pricing Structures',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Communication and Collaboration',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Delayed Timelines',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Time-consuming Revisions',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Longer Processing Times',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Loss of Sales',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Site / Job Management',
      challenges: [
        {
          problem: 'Compliance with Safety Regulations',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Monitoring Progress',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Resource Allocation and Scheduling',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Quality Control and Assurance',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Reduced Efficiency and Productivity',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Delays in Project Completion',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Lack of Accountability',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Inefficient Utilization of Resources',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Safety Management',
      challenges: [
        {
          problem: 'Manual paperwork',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Delayed Access to Information',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Issuing Handover Certificates',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Compliance Tracking',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Informed Decision Making',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Loss of Information',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Decreased Productivity',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Legal Implications',
          benefit: '',
          selected: false,
        },
      ],
    },
    {
      name: 'Inventory / Stock Management',
      challenges: [
        {
          problem: 'Resource Utilization',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Managing Deliveries',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Tracking Inventory',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
        {
          problem: 'Inaccurate Counts',
          solution: 'Cloudscaff Estimates',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Loss of Income',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Delayed Job Completion',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Planning and Forecasting',
          benefit: '',
          selected: false,
        },
        {
          effect: 'Loss of Inventory',
          benefit: '',
          selected: false,
        },
      ],
    },
  ];
  selected: any;
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

  check(items: any[]) {
    return items.findIndex((item) => item.selected);
  }
}
