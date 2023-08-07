import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
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
    categories: [],
    date: new Date(),
    updatedBy: '',
    company: '',
  };
  form: FormGroup;
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

  get categoryForms() {
    return this.form.get('categories') as FormArray;
  }

  itemForms(categoryIndex: number) {
    return this.form.get(['categories', categoryIndex, 'items']) as FormArray;
  }

  addCategory() {
    const category = this.masterSvc.fb().group({
      name: ['', Validators.required],
      items: this.masterSvc.fb().array([]),
    });
    this.categoryForms.push(category);
  }
  addQuestion(categoryIndex: number) {
    const item = this.masterSvc.fb().group({
      question: ['', Validators.required],
    });
    const itemarray = this.form.get([
      'categories',
      categoryIndex,
      'items',
    ]) as FormArray;
    itemarray.push(item);
  }

  deleteCategory(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.categoryForms.removeAt(i);
    });
  }
  deleteQuestion(categoryIndex: number, i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const itemarray = this.form.get([
        'categories',
        categoryIndex,
        'items',
      ]) as FormArray;
      itemarray.removeAt(i);
    });
  }

  reorderQuestions(
    ev: CustomEvent<ItemReorderEventDetail> | any,
    categoryIndex: number
  ) {
    this.itemForms(categoryIndex).setValue(
      ev.detail.complete(this.itemForms(categoryIndex).value)
    );
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
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.autoUpdate();
    });
  }
  autoUpdate() {
    const user = this.masterSvc.store().selectSnapshot(UserState.user);
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.template.company = company.id;
    this.template.updatedBy = user.id;
    this.template = { ...this.template, ...this.form.value };
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
  }
  private init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.subs.add(
          this.masterSvc
            .edit()
            .getDocById(`company/${id}/templates`, 'handover')
            .subscribe((handover: HandoverTemplate) => {
              if (handover) {
                this.form = this.masterSvc.fb().group({
                  categories: this.masterSvc.fb().array([]),
                });
                if (handover.categories.length > 0) {
                  handover.categories.forEach((c) => {
                    const category = this.masterSvc.fb().group({
                      name: [c.name, Validators.required],
                      items: this.masterSvc.fb().array([]),
                    });
                    c.items.forEach((i) => {
                      const item = this.masterSvc.fb().group({
                        question: [i.question, Validators.required],
                      });
                      (category.get('items') as FormArray).push(item);
                    });
                    this.categoryForms.push(category);
                  });
                } else {
                  this.addCategory();
                  this.addQuestion(0);
                }
                Object.assign(this.template, handover);
              } else {
                this.form = this.masterSvc.fb().group({
                  categories: this.masterSvc.fb().array([]),
                });
                this.addCategory();
                this.addQuestion(0);
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
