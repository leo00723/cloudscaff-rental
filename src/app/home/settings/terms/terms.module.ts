import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { TermsPageRoutingModule } from './terms-routing.module';
import { TermsPage } from './terms.page';
import { AddTermsComponent } from './add-terms/add-terms.component';

@NgModule({
  imports: [ComponentsModule, TermsPageRoutingModule],
  declarations: [TermsPage, AddTermsComponent],
})
export class TermsPageModule {}
