import { NgModule } from '@angular/core';

import { ComponentsModule } from 'src/app/components/components.module';
import { SiteInstructionsPageRoutingModule } from './site-instructions-routing.module';
import { SiteInstructionsPage } from './site-instructions.page';

@NgModule({
  imports: [ComponentsModule, SiteInstructionsPageRoutingModule],
  declarations: [SiteInstructionsPage],
})
export class SiteInstructionsPageModule {}
