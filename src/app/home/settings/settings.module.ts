import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';

@NgModule({
  imports: [SettingsPageRoutingModule, ComponentsModule],
  declarations: [SettingsPage],
})
export class SettingsPageModule {}
