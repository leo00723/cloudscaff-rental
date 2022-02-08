import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-skeleton-text',
  template: `
    <ion-skeleton-text
      animated
      class="rounded-lg"
      style="width: 95%;"
    ></ion-skeleton-text>
    <ion-skeleton-text animated class="rounded-lg w-75"></ion-skeleton-text>
    <ion-skeleton-text
      animated
      class="rounded-lg"
      shape="round"
    ></ion-skeleton-text>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonTextComponent {}
