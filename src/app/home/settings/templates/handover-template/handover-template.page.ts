import { Component, OnDestroy, OnInit } from '@angular/core';
import { ItemReorderEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HandoverTemplate } from 'src/app/models/handoverTemplate.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-handover-template',
  templateUrl: './handover-template.page.html',
})
export class HandoverTemplatePage implements OnInit, OnDestroy {
  loading = false;
  ready = false;
  template: HandoverTemplate = {
    detail: '',
    maxLoads: [''],
    date: new Date(),
    updatedBy: '',
    company: '',
  };
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {}
  ngOnInit(): void {
    this.init();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ionViewDidEnter() {
    this.ready = true;
  }
  trackItem(index) {
    return index;
  }
  doReorder(ev: CustomEvent<ItemReorderEventDetail> | any) {
    this.template.maxLoads = ev.detail.complete(this.template.maxLoads);
  }
  setItem(i: number, ev) {
    this.template.maxLoads[i] = ev;
  }
  deleteItem(i: number) {
    this.template.maxLoads.splice(i, 1);
  }
  addItem() {
    this.template.maxLoads.push('');
  }
  update() {
    const user = this.masterSvc.store().selectSnapshot(UserState.user);
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.template.company = company.id;
    this.template.updatedBy = user.id;
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.masterSvc
        .edit()
        .setDoc(`company/${company.id}/templates`, this.template, 'handover')
        .then(() => {
          this.masterSvc
            .notification()
            .toast('Template updated successfully', 'success')
            .then(() => {
              this.loading = false;
            });
        })
        .catch((error) => {
          console.error(error);
          this.masterSvc
            .notification()
            .toast('Something went wrong! Try again later.', 'danger')
            .then(() => {
              this.loading = false;
            });
        });
    });
  }
  private init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.subs.add(
          this.masterSvc
            .edit()
            .getDocById(`company/${id}/templates`, 'handover')
            .subscribe((handover: HandoverTemplate) => {
              if (handover) {
                Object.assign(this.template, handover);
              }
            })
        );
      } else {
        this.masterSvc.log(
          '-----------------------try templates----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
