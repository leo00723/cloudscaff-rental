import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnquiriesPageRoutingModule } from './enquiries-routing.module';

import { EnquiriesPage } from './enquiries.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddEnquiryComponent } from './add-enquiry/add-enquiry.component';
import { EnquiryTableComponent } from './enquiry-table/enquiry-table.component';

@NgModule({
  imports: [ComponentsModule, EnquiriesPageRoutingModule],
  declarations: [EnquiriesPage, AddEnquiryComponent, EnquiryTableComponent],
})
export class EnquiriesPageModule {}
