import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { InputTextComponent } from './input-text/input-text.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { HeaderComponent } from './header/header.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClientModule } from '@angular/common/http';

const COMPONENTS = [
  InputTextComponent,
  ShowHidePasswordComponent,
  SkeletonTextComponent,
  HeaderComponent,
  HeaderCondensedComponent,
];
const IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  IonicModule,
  HttpClientModule,
  NgxDatatableModule,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
