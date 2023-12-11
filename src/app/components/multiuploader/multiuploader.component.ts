import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { UploadedFile } from 'src/app/models/uploadedFile.model';
import { UploadTaskComponent } from './upload-task/upload-task.component';

@Component({
  selector: 'app-multiuploader',
  templateUrl: './multiuploader.component.html',
  styleUrls: ['./multiuploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiuploaderComponent {
  @ViewChildren(UploadTaskComponent)
  uploadTasks: QueryList<UploadTaskComponent>;

  @Input() autoupload = false;
  @Output() uploaded = new EventEmitter<UploadedFile[]>();

  isHovering: boolean;
  files: { file: File; data: UploadedFile }[] = [];
  uploading = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList | any, manual?: boolean, input?: any) {
    const list = manual ? files.target.files : files;
    for (let i = 0; i < list.length; i++) {
      this.files.push({ file: list.item(i), data: null });
    }
    if (this.autoupload) {
      setTimeout(async () => {
        const urls = await this.startUpload();
        this.uploaded.emit(urls);
      }, 200);
    }
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  async startUpload() {
    const urls: UploadedFile[] = [];
    this.uploading = true;
    this.cdRef.detectChanges();
    for await (const task of this.uploadTasks) {
      const data = await task.startUpload();
      urls.push(data);
    }
    this.uploading = false;
    this.cdRef.detectChanges();
    return urls;
  }
}
