import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IonReorderGroup, ItemReorderEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-component-types',
  templateUrl: './component-types.page.html',
})
export class ComponentTypesPage implements OnInit, OnDestroy {
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  items = [''];
  form: FormGroup;
  loading = false;
  sanitizedBlobUrl: any;
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.init();
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
  addItem(categoryIndex: number) {
    const item = this.masterSvc.fb().group({
      size: ['', Validators.required],
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
  deleteItem(categoryIndex: number, i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const itemarray = this.form.get([
        'categories',
        categoryIndex,
        'items',
      ]) as FormArray;
      itemarray.removeAt(i);
    });
  }

  doReorder(
    ev: CustomEvent<ItemReorderEventDetail> | any,
    categoryIndex: number
  ) {
    this.itemForms(categoryIndex).setValue(
      ev.detail.complete(this.itemForms(categoryIndex).value)
    );
  }

  async update() {
    console.log('update');
    this.loading = true;
    try {
      const company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);
      const user = this.masterSvc.store().selectSnapshot(UserState.user);
      const template = {
        ...this.form.value,
        date: new Date(),
        updatedBy: user.id,
        company: company.id,
      };
      await this.masterSvc
        .edit()
        .setDoc(`company/${company.id}/templates`, template, 'componentTypes');

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

  export() {}

  onFileChanged(event) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      try {
        const selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile, 'UTF-8');
        fileReader.onload = async () => {
          const data = JSON.parse(fileReader.result.toString());
          const company = this.masterSvc
            .store()
            .selectSnapshot(CompanyState.company);
          const user = this.masterSvc.store().selectSnapshot(UserState.user);
          const template = {
            ...data,
            date: new Date(),
            updatedBy: user.id,
            company: company.id,
          };
          await this.masterSvc
            .edit()
            .setDoc(
              `company/${company.id}/templates`,
              template,
              'componentTypes'
            );
          this.masterSvc.notification().toast('Import Successful', 'success');
        };
        fileReader.onerror = (error) => {
          console.log(error);
        };
      } catch (error) {
        console.log(error);
      }
    });
  }
  private init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.subs.add(
          this.masterSvc
            .edit()
            .getDocById(`company/${id}/templates`, 'componentTypes')
            .subscribe((components) => {
              if (components) {
                if (components.categories.length > 0) {
                  const blob = new Blob([JSON.stringify(components, null, 2)], {
                    type: 'application/json',
                  });

                  this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(
                    window.URL.createObjectURL(blob)
                  );
                }
                this.form = this.masterSvc.fb().group({
                  categories: this.masterSvc.fb().array(
                    components.categories.map((c) =>
                      this.masterSvc.fb().group({
                        name: [c.name, Validators.required],
                        items: this.masterSvc.fb().array(
                          c.items.map((i) =>
                            this.masterSvc.fb().group({
                              size: [i.size, Validators.required],
                            })
                          )
                        ),
                      })
                    )
                  ),
                });
              } else {
                this.form = this.masterSvc.fb().group({
                  categories: this.masterSvc.fb().array([]),
                });
                this.addCategory();
                this.addItem(0);
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
