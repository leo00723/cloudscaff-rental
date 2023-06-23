import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multiuploader',
  templateUrl: './multiuploader.component.html',
  styleUrls: ['./multiuploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiuploaderComponent {
  isHovering: boolean;
  files: File[] = [];

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList | any, manual?: boolean) {
    const list = manual ? files.target.files : files;
    for (let i = 0; i < list.length; i++) {
      this.files.push(list.item(i));
    }
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }
}
