import { NgModule } from '@angular/core';

import { ComponentsModule } from 'src/app/components/components.module';
import { SiteInstructionsPageRoutingModule } from './site-instructions-routing.module';
import { SiteInstructionsPage } from './site-instructions.page';
import { AddEnquiryComponent } from '../enquiries/add-enquiry/add-enquiry.component';
import { EnquiryTableComponent } from '../enquiries/enquiry-table/enquiry-table.component';

@NgModule({
  imports: [ComponentsModule, SiteInstructionsPageRoutingModule],
  declarations: [
    SiteInstructionsPage,
    AddEnquiryComponent,
    EnquiryTableComponent,
  ],
})
export class SiteInstructionsPageModule {}
