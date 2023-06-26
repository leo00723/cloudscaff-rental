import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { UploadedFile } from 'src/app/models/uploadedFile.model';

@Component({
  selector: 'app-multiuploader',
  templateUrl: './multiuploader.component.html',
  styleUrls: ['./multiuploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiuploaderComponent {
  @Output() data = new EventEmitter<{ file: File; data: UploadedFile }[]>();
  isHovering: boolean;
  files: { file: File; data: UploadedFile }[] = [];

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList | any, manual?: boolean) {
    const list = manual ? files.target.files : files;
    for (let i = 0; i < list.length; i++) {
      this.files.push({ file: list.item(i), data: null });
    }
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.data.emit(this.files);
  }

  setData(data: UploadedFile, index: number) {
    this.files[index].data = data;
    this.data.emit(this.files);
  }
}
