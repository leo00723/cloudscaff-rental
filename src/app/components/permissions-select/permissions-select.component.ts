import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent } from '@ionic/angular';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-permissions-select',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './permissions-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsSelectComponent implements OnInit {
  @Input() user: User;
  @Input() company: Company;
  @Input() showInput = true;
  @Output() selectedChanged: EventEmitter<any> = new EventEmitter();

  permissionsNoBilling = [
    {
      title: 'Admin',
      options: [
        { name: 'Super Admin', selected: false },
        { name: 'Site Admin', selected: false },
        { name: 'Inventory Admin', selected: false },
      ],
    },
    {
      title: 'Navigation',
      options: [
        { name: 'Enquiries', selected: false },
        { name: 'Instructions', selected: false },
        { name: 'Handover List', selected: false },
        { name: 'Inventory', selected: false },
        { name: 'Settings', selected: false },
      ],
    },
    {
      title: 'Sites',
      options: [
        { name: 'Site Deliveries', selected: false },
        { name: 'Site Requests', selected: false },
        { name: 'Site Returns', selected: false },
        { name: 'Site Instructions', selected: false },
      ],
    },
    {
      title: 'Scaffolds',
      options: [
        { name: 'Handovers', selected: false },
        { name: 'Inspections', selected: false },
        { name: 'Dismantles', selected: false },
      ],
    },
    {
      title: 'Inventory',
      options: [
        { name: 'Deliveries', selected: false },
        { name: 'Inventory Requests', selected: false },
        { name: 'Inventory Returns', selected: false },
        { name: 'Transfers', selected: false },
      ],
    },
  ];
  permissionsBilling = [
    {
      title: 'Admin',
      options: [
        { name: 'Super Admin', selected: false },
        { name: 'Site Admin', selected: false },
        { name: 'Inventory Admin', selected: false },
      ],
    },
    {
      title: 'Navigation',
      options: [
        { name: 'Enquiries', selected: false },
        { name: 'Estimates', selected: false },
        { name: 'Instructions', selected: false },
        { name: 'Handovers', selected: false },
        { name: 'Inventory', selected: false },
        { name: 'Statements', selected: false },
        { name: 'Settings', selected: false },
      ],
    },
    {
      title: 'Estimates',
      options: [
        { name: 'Basic Estimates', selected: false },
        { name: 'Inventory Rent Estimates', selected: false },
        { name: 'Inventory Sell Estimates', selected: false },
        { name: 'Standard Estimates', selected: false },
        { name: 'Bulk Estimates', selected: false },
        { name: 'Inventory Estimates', selected: false },
      ],
    },
    {
      title: 'Sites',
      options: [
        { name: 'Site Deliveries', selected: false },
        { name: 'Site Requests', selected: false },
        { name: 'Site Returns', selected: false },
        { name: 'Site Instructions', selected: false },
        { name: 'Payment Applications', selected: false },
      ],
    },
    {
      title: 'Scaffolds',
      options: [
        { name: 'Handovers', selected: false },
        { name: 'Inspections', selected: false },
        { name: 'Dismantles', selected: false },
        { name: 'Invoices', selected: false },
        { name: 'Payments', selected: false },
        { name: 'Credit Notes', selected: false },
      ],
    },
    {
      title: 'Inventory',
      options: [
        { name: 'Deliveries', selected: false },
        { name: 'Billable Shipments', selected: false },
        { name: 'Inventory Requests', selected: false },
        { name: 'Inventory Returns', selected: false },
        { name: 'Transfers', selected: false },
      ],
    },
  ];

  permissions = [];

  data: any[];

  isOpen = false;
  selected = [];
  filtered = [];

  constructor() {}

  ngOnInit(): void {
    this.permissions = this.company?.removeBilling
      ? this.permissionsNoBilling
      : this.permissionsBilling;
    if (this.user.permissions) {
      for (const category of this.permissions) {
        for (const option of category.options) {
          const item = this.user.permissions.find(
            (foundItem) => foundItem.name === option.name
          );

          if (item) {
            option.selected = item.selected;
          }
        }
      }
    }

    this.filtered = [...this.permissions];
  }

  open() {
    this.isOpen = true;
  }

  cancel() {
    this.isOpen = false;
  }

  select() {
    this.selected = this.permissions.reduce((accumulator, category) => {
      const selectedOptions = category.options.filter(
        (option) => option.selected
      );
      return accumulator.concat(selectedOptions);
    }, []);

    this.selectedChanged.emit(this.selected);
    this.isOpen = false;
  }

  filter(event: SearchbarCustomEvent) {
    const filter = event.detail.value.toLowerCase();
    this.filtered = this.permissions.reduce((accumulator, category) => {
      const filteredOptions = category.options.filter((option) =>
        option.name.toLowerCase().includes(filter)
      );

      if (filteredOptions.length > 0) {
        accumulator.push({
          title: category.title,
          options: filteredOptions,
        });
      }

      return accumulator;
    }, []);
  }
}
