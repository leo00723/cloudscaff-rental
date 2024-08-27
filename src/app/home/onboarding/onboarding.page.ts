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
          solution:
            'Centralized lead information, automated lead capture and tracking processes',
          selected: false,
        },
        {
          problem: 'Qualification and Scoring',
          solution:
            'Standardized qualification criteria and lead scoring tools',
          selected: false,
        },
        {
          problem: 'Follow-Up and Nurturing',
          solution:
            'Automated follow-up processes, personalized communication and lead nurturing workflows.',
          selected: false,
        },
        {
          problem: 'Analytics and Reporting',
          solution:
            'Capture and analyze data on lead performance, conversion rates and sales metrics',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Low Conversion Rates',
          benefit: 'Integrated lead scoring, nurturing and follow-up processes',
          selected: false,
        },
        {
          effect: 'Inconsistent Customer Experience',
          benefit:
            'Standardized and automated processes ensures consistency and efficiency',
          selected: false,
        },
        {
          effect: 'Loss of Revenue',
          benefit: 'Effectively capture, track, nurture and follow-up on leads',
          selected: false,
        },
        {
          effect: 'Inaccurate Data and Reporting',
          benefit:
            'Standardized data entry processes, validate data accuracy and generate comprehensive and reliable reports',
          selected: false,
        },
      ],
    },
    // {
    //   name: 'Estimate / Quote Management',
    //   challenges: [
    //     {
    //       problem: 'Incomplete or Inaccurate Information',
    //       solution:
    //         'Standardized templates, automated data entry and real-time collaboration.',
    //       selected: false,
    //     },
    //     {
    //       problem: 'Changing Project Requirements',
    //       solution:
    //         'Manage evolving needs with flexibility, consistency and enhanced revision processes.',
    //       selected: false,
    //     },
    //     {
    //       problem: 'Complex Pricing Structures',
    //       solution:
    //         'Tools to adapt to pricing structures based on project requirements, ensuring clarity and accuracy in pricing.',
    //       selected: false,
    //     },
    //     {
    //       problem: 'Communication and Collaboration',
    //       solution:
    //         'Simultaneous document editing by multiple users for efficient collaboration',
    //       selected: false,
    //     },
    //   ],
    //   impacts: [
    //     {
    //       effect: 'Delayed Timelines',
    //       benefit:
    //         'Efficient change management processes and tools for quick adjustment of project timelines',
    //       selected: false,
    //     },
    //     {
    //       effect: 'Time-consuming Revisions',
    //       benefit:
    //         'Automated revision process and streamlining approval processes for faster turnaround times',
    //       selected: false,
    //     },
    //     {
    //       effect: 'Longer Processing Times',
    //       benefit:
    //         'Automating estimate generation, real-time collaboration and streamlined approval process',
    //       selected: false,
    //     },
    //     {
    //       effect: 'Loss of Sales',
    //       benefit:
    //         'Provide accurate and timely estimates, quick follow-ups and enabling customization and personalization to meet customer needs',
    //       selected: false,
    //     },
    //   ],
    // },
    {
      name: 'Site / Job Management',
      challenges: [
        {
          problem: 'Compliance with Safety Regulations',
          solution:
            'Tools for creating and managing safety documents, prompting inspections, and incident reporting',
          selected: false,
        },
        {
          problem: 'Monitoring Progress',
          solution: 'Track scaffolds, tasks, timelines and real-time progress',
          selected: false,
        },
        {
          problem: 'Resource Allocation and Scheduling',
          solution:
            'Optimize resource utilization, balance workloads and scheduling to maximize productivity and meet project deadlines',
          selected: false,
        },
        {
          problem: 'Quality Control and Assurance',
          solution: 'Track, report and ensure adherence to quality standards',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Reduced Efficiency and Productivity',
          benefit:
            'Optimized workflows and boost productivity with effective task and resource utilization tools',
          selected: false,
        },
        {
          effect: 'Delays in Project Completion',
          benefit:
            'Accelerate delivery by improving coordination and tracking progress effectively',
          selected: false,
        },
        {
          effect: 'Lack of Accountability',
          benefit:
            'Promote responsibility and ownership with enhanced task tracking capabilities',
          selected: false,
        },
        {
          effect: 'Inefficient Utilization of Resources',
          benefit:
            'Achieve greater efficiency and cost savings through resource optimization capabilities',
          selected: false,
        },
      ],
    },
    {
      name: 'Safety Management',
      challenges: [
        {
          problem: 'Manual Paperwork',
          solution: 'Digitize and automate the document creation processes',
          selected: false,
        },
        {
          problem: 'Delayed Access to Information',
          solution:
            'Access to real-time data for faster decision-making and improved efficiency',
          selected: false,
        },
        {
          problem: 'Managing Handover Certificates',
          solution: 'Effortlessly create, track, manage and organize handovers',
          selected: false,
        },
        {
          problem: 'Compliance Tracking',
          solution:
            'Ensure adherence to regulations with alerts and notifications prompting compliance',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Informed Decision Making',
          benefit: 'Real-time insights and comprehensive data analysis',
          selected: false,
        },
        {
          effect: 'Lost Information',
          benefit:
            'Centralize and safeguard information for easy access and retrieval',
          selected: false,
        },
        {
          effect: 'Decreased Productivity',
          benefit:
            'Efficient task tracking and streamlined workflow management',
          selected: false,
        },
        {
          effect: 'Legal Implications',
          benefit:
            'Mitigate risks and ensure compliance through comprehensive tracking and documentation',
          selected: false,
        },
      ],
    },
    {
      name: 'Inventory / Stock Management',
      challenges: [
        {
          problem: 'Resource Utilization',
          solution:
            'Advanced algorithms and analytics to optimize stock levels and forecast',
          selected: false,
        },
        {
          problem: 'Managing Deliveries / Shipments',
          solution: 'Document, track, manage and coordinate deliveries',
          selected: false,
        },
        {
          problem: 'Tracking Inventory',
          solution:
            'Monitor inventory locations, utilization, and activity for comprehensive insights',
          selected: false,
        },
        {
          problem: 'Inaccurate Counts',
          solution:
            'Automated inventory tracking ensures accurate and reliable inventory counts',
          selected: false,
        },
      ],
      impacts: [
        {
          effect: 'Loss of Income',
          benefit:
            'Reduce losses with efficient and effective inventory management',
          selected: false,
        },
        {
          effect: 'Delayed Job Completion',
          benefit:
            'Ensuring accurate inventory tracking, minimizing stockouts, and improving logistics',
          selected: false,
        },
        {
          effect: 'Planning and Forecasting',
          benefit:
            'Analyze inventory data, track demand patterns, identify trends and make informed decisions',
          selected: false,
        },
        {
          effect: 'Lost Inventory',
          benefit: 'Automated tracking and real-time inventory monitoring',
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

  next({ user, company }) {
    if (!(user?.needsSetup || company?.needsSetup)) {
      this.router.navigateByUrl('/dashboard/sites');
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
