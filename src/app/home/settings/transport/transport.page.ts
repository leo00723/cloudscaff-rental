import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { AddTransportComponent } from './add-transport/add-transport.component';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.page.html',
})
export class TransportPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  transport$: Observable<Transport[] | any>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }
  async addItem() {
    const modal = await this.masterSvc.modal().create({
      component: AddTransportComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addItem',
    });
    return await modal.present();
  }
  async viewItem(transport: Transport) {
    const modal = await this.masterSvc.modal().create({
      component: AddTransportComponent,
      componentProps: {
        value: transport,
        isEdit: true,
        isDelete: true,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewItem',
    });
    return await modal.present();
  }
  private init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.transport$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/transport`, 'name', 'asc');
      } else {
        this.masterSvc.log(
          '-----------------------try transport----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
