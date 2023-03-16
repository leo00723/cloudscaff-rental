import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-scaffold-types',
  templateUrl: './scaffold-types.page.html',
})
export class ScaffoldTypesPage implements OnDestroy {
  types: string[] = [];
  loading = false;
  private subs = new Subscription();

  constructor(private masterSvc: MasterService) {
    this.init();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  setItem(i: number, ev) {
    this.types[i] = ev;
  }
  trackItem(index) {
    return index;
  }
  update() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.autoUpdate();
    });
  }
  async autoUpdate() {
    this.loading = true;
    try {
      const company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);
      const user = this.masterSvc.store().selectSnapshot(UserState.user);
      const template = {
        types: this.types,
        date: new Date(),
        updatedBy: user.id,
        company: company.id,
      };
      await this.masterSvc
        .edit()
        .setDoc(`company/${company.id}/templates`, template, 'scaffoldTypes');

      this.masterSvc
        .notification()
        .toast('Template updated successfully', 'success');
      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating the template. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }
  add() {
    this.types.push('');
  }
  delete(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.types.splice(i, 1);
    });
  }
  private init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.subs.add(
          this.masterSvc
            .edit()
            .getDocById(`company/${id}/templates`, 'scaffoldTypes')
            .subscribe((scaffoldTypes) => {
              if (scaffoldTypes) {
                this.types = scaffoldTypes.types;
              } else {
                this.add();
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
