import { Component, OnInit } from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.page.html',
})
export class TemplatesPage implements OnInit {
  templates = [
    {
      title: 'Inspection Template',
      description: 'Here you update the template for your inspections.',
      path: 'inspection',
    },
    {
      title: 'Handover Template',
      description: 'Here you update the template for your handovers.',
      path: 'handover',
    },
  ];
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {}
  async editTemplate(path: string) {
    this.masterSvc
      .store()
      .dispatch(new Navigate(`/dashboard/settings/templates/${path}`));
  }
}
