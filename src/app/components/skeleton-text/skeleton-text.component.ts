import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-text',
  template: `
    <ion-skeleton-text animated></ion-skeleton-text>
    <ion-skeleton-text animated style="width: 80%;"></ion-skeleton-text>
    <ion-skeleton-text animated style="width: 95%;"></ion-skeleton-text>
  `,
})
export class SkeletonTextComponent {}
