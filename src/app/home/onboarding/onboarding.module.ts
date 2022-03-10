import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { OnboardingPageRoutingModule } from './onboarding-routing.module';
import { OnboardingPage } from './onboarding.page';

@NgModule({
  imports: [ComponentsModule, OnboardingPageRoutingModule],
  declarations: [OnboardingPage],
})
export class OnboardingPageModule {}
